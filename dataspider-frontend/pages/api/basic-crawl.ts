import { NextApiRequest, NextApiResponse } from "next";
import * as cheerio from "cheerio";
import { rateLimit } from "@/lib/rate-limit";
import { isValidUrl } from "@/lib/validation";

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

interface CrawlResult {
  title: string;
  description: string;
  headings: Array<{ level: number; text: string }>;
  links: Array<{ href: string; text: string }>;
  images: string[];
  text: string[];
  status: string;
}

const TIMEOUT = 30000; // 30 seconds
const MAX_CONTENT_LENGTH = 10 * 1024 * 1024; // 10MB

function cleanText(text: string): string {
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Apply rate limiting
    await limiter.check(res, 10, "CACHE_TOKEN"); // 10 requests per minute per IP
  } catch {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  const { url } = req.body;

  // Validate URL
  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL provided" });
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
    const $ = cheerio.load(html, { decodeEntities: true });

    // Extract basic information
    const title = $("title").text().trim();
    const description =
      $('meta[name="description"]').attr("content")?.trim() || "";

    // Extract headings
    const headings: Array<{ level: number; text: string }> = [];
    $("h1, h2, h3, h4, h5, h6").each(function () {
      const tag = $(this).prop("tagName")?.toLowerCase() || "";
      if (tag && tag.length > 1) {
        const text = cleanText($(this).text());
        if (text) {
          headings.push({
            level: parseInt(tag[1]),
            text,
          });
        }
      }
    });

    // Extract links
    const links: Array<{ href: string; text: string }> = [];
    $("a").each(function () {
      const href = $(this).attr("href");
      const text = cleanText($(this).text());
      if (href && text) {
        const absoluteHref = getAbsoluteUrl(url, href);
        if (absoluteHref) {
          links.push({ href: absoluteHref, text });
        }
      }
    });

    // Extract images
    const images: string[] = [];
    $("img").each(function () {
      const src = $(this).attr("src");
      const alt = $(this).attr("alt");
      if (src) {
        const absoluteSrc = getAbsoluteUrl(url, src);
        if (absoluteSrc) {
          images.push(absoluteSrc);
        }
      }
    });

    // Extract text content from paragraphs
    const textContent: string[] = [];
    $("p, article, section").each(function () {
      const text = cleanText($(this).text());
      if (text) {
        textContent.push(text);
      }
    });

    const result: CrawlResult = {
      title,
      description,
      headings,
      links,
      images,
      text: textContent,
      status: "success",
    };

    return res.status(200).json({ data: result });
  } catch (error) {
    console.error("Crawling error:", error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return res.status(504).json({ error: "Request timeout" });
      }
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "Failed to crawl the website" });
  }
}
