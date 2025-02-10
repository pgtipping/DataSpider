import { NextApiRequest, NextApiResponse } from "next";
import { JSDOM } from "jsdom";
import { OpenAI } from "openai";
import { rateLimit } from "@/lib/rate-limit";
import { isValidUrl } from "@/lib/validation";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ExtractedContent {
  content: string;
  metadata?: {
    wordCount: number;
    charCount: number;
    readingTime: number;
  };
}

const MAX_CONTENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_OPERATION_TIME = 60000; // 60 seconds
const MAX_TOKENS = 4000; // Maximum tokens for OpenAI API

// Content selectors for main content extraction
const CONTENT_SELECTORS = [
  "article",
  "main",
  "[role='main']",
  ".main-content",
  "#main-content",
  ".post-content",
  ".article-content",
  ".entry-content",
  ".content",
];

// Selectors for content to remove
const NOISE_SELECTORS = [
  "header",
  "footer",
  "nav",
  ".navigation",
  ".menu",
  ".sidebar",
  ".comments",
  ".advertisement",
  ".ads",
  ".social-share",
  "script",
  "style",
  "noscript",
  "iframe",
];

function cleanText(text: string): string {
  return text
    .replace(/[\s\n\r]+/g, " ")
    .trim()
    .replace(/[^\x20-\x7E\n]/g, ""); // Remove non-printable characters except newlines
}

function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

function truncateText(text: string, maxTokens: number): string {
  // Rough estimation: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "...";
}

async function extractContent(
  html: string,
  format: string
): Promise<ExtractedContent> {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Remove noise elements
  NOISE_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => el.remove());
  });

  // Extract main content
  let mainContent = "";
  let contentElement = null;

  // Try to find main content using selectors
  for (const selector of CONTENT_SELECTORS) {
    contentElement = document.querySelector(selector);
    if (contentElement) break;
  }

  // If no main content found, fall back to body
  if (!contentElement) {
    contentElement = document.body;
  }

  // Extract text content with better formatting
  const paragraphs = Array.from(
    contentElement.querySelectorAll("p, h1, h2, h3, h4, h5, h6")
  );
  mainContent = paragraphs
    .map((el) => {
      const text = cleanText(el.textContent || "");
      if (el.tagName.toLowerCase().startsWith("h")) {
        return `\n\n${text}\n`;
      }
      return text;
    })
    .join("\n");

  // Clean and normalize content
  mainContent = cleanText(mainContent);

  // Check content size
  const contentSize = new TextEncoder().encode(mainContent).length;
  if (contentSize > MAX_CONTENT_SIZE) {
    throw new Error("Content size limit exceeded");
  }

  if (format === "text") {
    return {
      content: mainContent,
      metadata: {
        wordCount: mainContent.split(/\s+/).length,
        charCount: mainContent.length,
        readingTime: calculateReadingTime(mainContent),
      },
    };
  }

  // For markdown and JSON, use OpenAI to format the content
  const truncatedContent = truncateText(mainContent, MAX_TOKENS);

  const systemPrompt =
    format === "markdown"
      ? "You are a content formatter that converts webpage content to clean, well-structured markdown. Focus on maintaining the original content's hierarchy and structure while making it more readable."
      : "You are a content extractor that identifies and structures key information from webpages into JSON format. Extract key details like title, author, date, main points, and any relevant metadata.";

  const userPrompt =
    format === "markdown"
      ? `Convert this webpage content to well-formatted markdown, maintaining proper headings, lists, and emphasis:\n\n${truncatedContent}`
      : `Extract and structure the key information from this webpage content into a JSON format. Include relevant fields like title, description, main points, and any other important information:\n\n${truncatedContent}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: MAX_TOKENS,
    });

    const formattedContent = completion.choices[0]?.message?.content || "";

    return {
      content: formattedContent,
      metadata: {
        wordCount: mainContent.split(/\s+/).length,
        charCount: mainContent.length,
        readingTime: calculateReadingTime(mainContent),
      },
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to process content with AI");
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
    await limiter.check(res, 5, "CACHE_TOKEN"); // 5 requests per minute per IP
  } catch {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  const { url, format = "text" } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL provided" });
  }

  if (!["text", "markdown", "json"].includes(format)) {
    return res
      .status(400)
      .json({ error: "Invalid format. Must be one of: text, markdown, json" });
  }

  if (!process.env.OPENAI_API_KEY && format !== "text") {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  try {
    // Set up operation timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MAX_OPERATION_TIME);

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
    if (contentLength > MAX_CONTENT_SIZE) {
      throw new Error("Content size limit exceeded");
    }

    const html = await response.text();
    const result = await extractContent(html, format);

    return res.status(200).json({ data: result });
  } catch (error) {
    console.error("Extraction error:", error);

    if (error instanceof Error) {
      if (error.message.includes("timeout") || error.name === "AbortError") {
        return res.status(504).json({ error: "Operation timed out" });
      }
      if (error.message.includes("size limit")) {
        return res.status(413).json({ error: "Content size limit exceeded" });
      }
      if (error.message.includes("OpenAI")) {
        return res.status(502).json({ error: "AI processing failed" });
      }
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "Failed to extract content" });
  }
}

export default handler;
