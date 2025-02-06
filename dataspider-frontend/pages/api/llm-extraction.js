import { JSDOM } from "jsdom";
import { OpenAI } from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW =
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const MAX_REQUESTS = parseInt(process.env.MAX_REQUESTS_PER_WINDOW) || 100;
const requestCounts = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || [];
  const validRequests = userRequests.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (validRequests.length >= MAX_REQUESTS) {
    return true;
  }

  validRequests.push(now);
  requestCounts.set(ip, validRequests);
  return false;
}

async function extractContentWithLLM(html, format) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Basic content extraction
  const title = document.querySelector("title")?.textContent?.trim() || "";
  const mainContent =
    document
      .querySelector("main, article, #content, .content")
      ?.textContent?.trim() ||
    document.body?.textContent?.trim() ||
    "";

  // Clean content
  const cleanContent = mainContent
    .replace(/\s+/g, " ")
    .replace(/\n+/g, "\n")
    .trim();

  // Use OpenAI to process the content
  try {
    const prompt = `Extract and format the following content from a webpage. Title: "${title}"\n\nContent: "${cleanContent.slice(
      0,
      3000
    )}..."\n\nFormat the output as ${format.toUpperCase()} and focus on the main points and key information.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that extracts and formats webpage content.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const processedContent = completion.choices[0].message.content;

    switch (format) {
      case "markdown":
        return {
          title,
          content: processedContent,
          format: "markdown",
        };
      case "json":
        return {
          title,
          content: processedContent,
          metadata: {
            wordCount: processedContent.split(/\s+/).length,
            charCount: processedContent.length,
            format: "json",
            processedBy: "GPT-3.5",
          },
        };
      case "text":
      default:
        return {
          title,
          content: processedContent,
          format: "text",
        };
    }
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to process content with LLM");
  }
}

export default async function handler(req, res) {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OpenAI API key not configured",
      message: "Please set the OPENAI_API_KEY environment variable",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: "Too many requests. Please try again later.",
      retryAfter: RATE_LIMIT_WINDOW / 1000,
    });
  }

  try {
    const { url, format = "text" } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    if (!["text", "markdown", "json"].includes(format)) {
      return res.status(400).json({
        error: "Invalid format. Supported formats: text, markdown, json",
      });
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
    const extractedContent = await extractContentWithLLM(html, format);

    res.status(200).json({
      success: true,
      data: extractedContent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("LLM Extraction Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
