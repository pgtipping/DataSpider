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
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

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
    const data = {
      title: document.querySelector("title")?.textContent?.trim() || "",
      description:
        document.querySelector('meta[name="description"]')?.content?.trim() ||
        "",
      headings: {
        h1: Array.from(document.querySelectorAll("h1")).map((h) =>
          h.textContent.trim()
        ),
        h2: Array.from(document.querySelectorAll("h2")).map((h) =>
          h.textContent.trim()
        ),
        h3: Array.from(document.querySelectorAll("h3")).map((h) =>
          h.textContent.trim()
        ),
      },
      links: Array.from(document.querySelectorAll("a"))
        .map((a) => ({
          text: a.textContent.trim(),
          href: a.href,
        }))
        .filter((link) => link.href && link.href.startsWith("http")),
      images: Array.from(document.querySelectorAll("img"))
        .map((img) => ({
          src: img.src,
          alt: img.alt,
        }))
        .filter((img) => img.src),
      text:
        document.body?.textContent?.trim().replace(/\s+/g, " ").slice(0, 1000) +
        "...",
    };

    res.status(200).json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Basic Crawl Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
