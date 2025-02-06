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

async function getJSDOM() {
  const { JSDOM } = await import("jsdom");
  return JSDOM;
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

  if (!url.includes("amazon.com")) {
    return res.status(400).json({ error: "Only Amazon URLs are supported" });
  }

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
    const JSDOM = await getJSDOM();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Enhanced product data extraction
    const productData = {
      title: document.querySelector("#productTitle")?.textContent?.trim() || "",
      price:
        document.querySelector(".a-price .a-offscreen")?.textContent?.trim() ||
        "",
      rating: document.querySelector("#acrPopover")?.title?.trim() || "",
      reviewCount:
        document.querySelector("#acrCustomerReviewText")?.textContent?.trim() ||
        "",
      availability:
        document.querySelector("#availability")?.textContent?.trim() || "",
      description:
        document.querySelector("#productDescription")?.textContent?.trim() ||
        "",
      features: Array.from(document.querySelectorAll("#feature-bullets li"))
        .map((li) => li.textContent.trim())
        .filter((text) => text !== ""),
      images: Array.from(
        document.querySelectorAll("#imgBlkFront, #landingImage")
      )
        .map((img) => img.src)
        .filter((src) => src),
      brand: document.querySelector("#bylineInfo")?.textContent?.trim() || "",
    };

    // Validate extracted data
    if (!productData.title) {
      throw new Error(
        "Failed to extract product title - possible bot detection"
      );
    }

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.status(200).json({
      success: true,
      data: productData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Amazon Product Extraction Error:", error);
    res.status(error.message.includes("bot detection") ? 429 : 500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
