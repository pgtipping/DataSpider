import puppeteer from "puppeteer";

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;
const requestCounts = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || [];

  // Remove old requests outside the window
  const validRequests = userRequests.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (validRequests.length >= MAX_REQUESTS) {
    return true;
  }

  // Add current request timestamp
  validRequests.push(now);
  requestCounts.set(ip, validRequests);
  return false;
}

async function loadDynamicContent(url, selector, maxClicks = 5) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    // Navigate to URL with timeout
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    let clickCount = 0;
    let hasMore = true;
    const results = [];

    while (hasMore && clickCount < maxClicks) {
      // Wait for content to be available
      await page.waitForSelector(selector, { timeout: 5000 }).catch(() => {
        hasMore = false;
      });

      if (!hasMore) break;

      // Extract current content
      const newContent = await page.evaluate((sel) => {
        const elements = document.querySelectorAll(sel);
        return Array.from(elements).map((el) => ({
          text: el.textContent.trim(),
          html: el.innerHTML,
          classes: Array.from(el.classList),
        }));
      }, selector);

      results.push(...newContent);

      // Try to click the "load more" button
      try {
        await page.click(selector);
        await page.waitForTimeout(1000); // Wait for new content to load
        clickCount++;
      } catch (error) {
        hasMore = false;
      }
    }

    return {
      clickCount,
      totalItems: results.length,
      items: results,
    };
  } finally {
    await browser.close();
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get client IP
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  // Check rate limit
  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: "Too many requests. Please try again later.",
      retryAfter: RATE_LIMIT_WINDOW / 1000,
    });
  }

  try {
    const { url, selector, maxClicks = 5 } = req.body;

    if (!url || !selector) {
      return res.status(400).json({ error: "URL and selector are required" });
    }

    const result = await loadDynamicContent(url, selector, maxClicks);

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dynamic Content Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
