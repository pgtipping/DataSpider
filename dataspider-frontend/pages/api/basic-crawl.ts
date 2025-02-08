import { NextApiRequest, NextApiResponse } from "next";
import * as cheerio from "cheerio";

interface CrawlResult {
  title: string;
  description: string;
  headings: Array<{ level: number; text: string }>;
  links: Array<{ href: string; text: string }>;
  images: string[];
  text: string;
  status: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract basic information
    const title = $("title").text();
    const description = $('meta[name="description"]').attr("content") || "";

    // Extract headings
    const headings: Array<{ level: number; text: string }> = [];
    $("h1, h2, h3, h4, h5, h6").each(function () {
      const tag = $(this).prop("tagName")?.toLowerCase() || "";
      if (tag && tag.length > 1) {
        headings.push({
          level: parseInt(tag[1]),
          text: $(this).text().trim(),
        });
      }
    });

    // Extract links
    const links: Array<{ href: string; text: string }> = [];
    $("a").each(function () {
      const href = $(this).attr("href");
      const text = $(this).text().trim();
      if (href && text) {
        links.push({ href, text });
      }
    });

    // Extract images
    const images: string[] = [];
    $("img").each(function () {
      const src = $(this).attr("src");
      if (src) {
        try {
          const absoluteSrc = new URL(src, url).toString();
          images.push(absoluteSrc);
        } catch (e) {
          console.warn("Invalid image URL:", src);
        }
      }
    });

    // Extract text content
    const text = $("body").text().replace(/\\s+/g, " ").trim();

    const result: CrawlResult = {
      title,
      description,
      headings,
      links,
      images,
      text,
      status: "success",
    };

    return res.status(200).json({ data: result });
  } catch (error) {
    console.error("Crawling error:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to crawl the website",
    });
  }
}
