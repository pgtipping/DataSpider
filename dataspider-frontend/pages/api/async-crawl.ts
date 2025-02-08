import { NextApiRequest, NextApiResponse } from "next";
import { JSDOM } from "jsdom";
import { withRateLimit } from "@/lib/rate-limit";

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

async function crawlUrl(url: string): Promise<CrawlResult> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "DataSpider/1.0 (Educational Purpose)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract basic information
    const title = document.title;
    const description =
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content") || "";

    // Extract h1s
    const h1s = Array.from(document.querySelectorAll("h1")).map(
      (h1) => (h1 as HTMLHeadingElement).textContent?.trim() || ""
    );

    // Extract links
    const links = Array.from(document.querySelectorAll("a"))
      .map((a) => ({
        href: (a as HTMLAnchorElement).href,
        text: a.textContent?.trim() || "",
      }))
      .filter((link) => link.href && !link.href.startsWith("javascript:"));

    return {
      url,
      status: "success",
      title,
      description,
      h1s,
      links: links.map((link) => link.href), // Keep compatibility with existing frontend for now
      linkData: links, // Add the full link data
    };
  } catch (error) {
    return {
      url,
      status: "error",
      h1s: [],
      links: [],
      error: error instanceof Error ? error.message : "Failed to crawl URL",
    };
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { urls } = req.body;

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "Please provide an array of URLs" });
  }

  if (urls.length > 10) {
    return res
      .status(400)
      .json({ error: "Maximum 10 URLs allowed per request" });
  }

  try {
    // Crawl all URLs concurrently
    const results = await Promise.all(urls.map(crawlUrl));
    return res.status(200).json({ data: results });
  } catch (error) {
    console.error("Crawling error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to crawl URLs",
    });
  }
}

export default withRateLimit(handler);
