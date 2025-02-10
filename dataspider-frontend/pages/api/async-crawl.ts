import { NextApiRequest, NextApiResponse } from "next";
import { JSDOM } from "jsdom";
import { rateLimit } from "@/lib/rate-limit";
import { isValidUrl } from "@/lib/validation";

interface CrawlResult {
  url: string;
  status: "success" | "error";
  title?: string;
  description?: string;
  h1s: string[];
  links: string[];
  linkData?: { href: string; text: string }[];
  error?: string;
}

const TIMEOUT = 30000; // 30 seconds
const MAX_CONTENT_LENGTH = 10 * 1024 * 1024; // 10MB

function cleanText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/[\s\n\r]+/g, " ")
    .trim()
    .replace(/[^\x20-\x7E]/g, ""); // Remove non-printable characters
}

function getAbsoluteUrl(baseUrl: string, relativeUrl: string): string {
  try {
    return new URL(relativeUrl, baseUrl).toString();
  } catch {
    return "";
  }
}

async function crawlUrl(url: string): Promise<CrawlResult> {
  if (!isValidUrl(url)) {
    return {
      url,
      status: "error",
      h1s: [],
      links: [],
      error: "Invalid URL format",
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "DataSpider-Crawler/1.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("text/html")) {
      throw new Error("URL does not point to an HTML page");
    }

    const contentLength = parseInt(
      response.headers.get("content-length") || "0"
    );
    if (contentLength > MAX_CONTENT_LENGTH) {
      throw new Error("Content too large");
    }

    const html = await response.text();
    const dom = new JSDOM(html, {
      url: url, // This helps resolve relative URLs
      referrer: url,
      contentType: "text/html",
      includeNodeLocations: false,
      storageQuota: 10000000, // 10MB
    });

    const document = dom.window.document;

    // Extract basic information
    const title = cleanText(document.title);
    const description = cleanText(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
    );

    // Extract h1s
    const h1s = Array.from(document.querySelectorAll("h1"))
      .map((h1) => cleanText(h1.textContent))
      .filter(Boolean);

    // Extract links
    const links = Array.from(document.querySelectorAll("a"))
      .map((a) => ({
        href: getAbsoluteUrl(url, (a as HTMLAnchorElement).href),
        text: cleanText(a.textContent),
      }))
      .filter(
        (link) =>
          link.href &&
          link.text &&
          !link.href.startsWith("javascript:") &&
          !link.href.startsWith("data:") &&
          !link.href.startsWith("file:")
      );

    return {
      url,
      status: "success",
      title,
      description,
      h1s,
      links: links.map((link) => link.href),
      linkData: links,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to crawl URL";
    console.error(`Error crawling ${url}:`, errorMessage);

    return {
      url,
      status: "error",
      h1s: [],
      links: [],
      error: errorMessage,
    };
  }
}

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500,
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Apply rate limiting
    await limiter.check(res, 10, "CACHE_TOKEN"); // 10 requests per minute per IP
  } catch {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  const { urls } = req.body;

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: "Please provide an array of URLs" });
  }

  // Filter out empty URLs and duplicates
  const validUrls = [...new Set(urls.filter((url) => url?.trim()))];

  if (validUrls.length === 0) {
    return res
      .status(400)
      .json({ error: "Please provide at least one valid URL" });
  }

  if (validUrls.length > 10) {
    return res
      .status(400)
      .json({ error: "Maximum 10 URLs allowed per request" });
  }

  try {
    // Crawl all URLs concurrently with a timeout
    const results = await Promise.all(validUrls.map(crawlUrl));
    return res.status(200).json({ data: results });
  } catch (error) {
    console.error("Crawling error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to crawl URLs",
    });
  }
}

export default handler;
