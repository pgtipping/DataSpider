import { JSDOM } from "jsdom";

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

async function crawlUrl(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract basic page information
    const title = document.querySelector("title")?.textContent || "";
    const description =
      document.querySelector('meta[name="description"]')?.content || "";
    const h1s = Array.from(document.querySelectorAll("h1")).map((h1) =>
      h1.textContent.trim()
    );
    const links = Array.from(document.querySelectorAll("a"))
      .map((a) => ({
        text: a.textContent.trim(),
        href: a.href,
      }))
      .filter((link) => link.href && link.href.startsWith("http"));

    return {
      url,
      title,
      description,
      h1s,
      links,
      status: "success",
    };
  } catch (error) {
    return {
      url,
      error: error.message,
      status: "error",
    };
  }
}

export default async function handler(req, res) {
  // Get client IP
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  // Check rate limit
  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: "Too many requests. Please try again later.",
      retryAfter: RATE_LIMIT_WINDOW / 1000,
    });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing URL parameter" });
  }

  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: "Please provide an array of URLs" });
    }

    if (urls.length > 10) {
      return res
        .status(400)
        .json({ error: "Maximum 10 URLs allowed per request" });
    }

    // Crawl all URLs concurrently
    const results = await Promise.all(urls.map((url) => crawlUrl(url)));

    res.status(200).json({
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Async Crawl Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
