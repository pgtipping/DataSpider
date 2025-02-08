import { NextApiRequest, NextApiResponse } from "next";
import { JSDOM } from "jsdom";
import { OpenAI } from "openai";
import { withRateLimit } from "@/lib/rate-limit";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ExtractedContent {
  content: string;
  metadata?: {
    wordCount: number;
    charCount: number;
  };
}

async function extractContent(
  html: string,
  format: string
): Promise<ExtractedContent> {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Extract main content
  const mainContent = document.body.textContent?.trim() || "";

  if (format === "text") {
    return {
      content: mainContent,
      metadata: {
        wordCount: mainContent.split(/\s+/).length,
        charCount: mainContent.length,
      },
    };
  }

  // For markdown and JSON, use OpenAI to format the content
  const prompt =
    format === "markdown"
      ? `Convert this webpage content to well-formatted markdown:\n\n${mainContent}`
      : `Extract and structure the key information from this webpage content into a JSON format:\n\n${mainContent}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          format === "markdown"
            ? "You are a content formatter that converts webpage content to clean, well-structured markdown."
            : "You are a content extractor that identifies and structures key information from webpages into JSON format.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  const formattedContent = completion.choices[0]?.message?.content || "";

  return {
    content: formattedContent,
    metadata: {
      wordCount: mainContent.split(/\s+/).length,
      charCount: mainContent.length,
    },
  };
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, format = "text" } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
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
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const result = await extractContent(html, format);

    return res.status(200).json({ data: result });
  } catch (error) {
    console.error("Extraction error:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to extract content",
    });
  }
}

export default withRateLimit(handler);
