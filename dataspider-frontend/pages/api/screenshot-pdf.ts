import puppeteer, {
  Browser,
  PDFOptions,
  PuppeteerLaunchOptions,
  Viewport,
} from "puppeteer";
import { NextApiRequest, NextApiResponse } from "next";

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW =
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || "") || 15 * 60 * 1000;
const MAX_REQUESTS = parseInt(process.env.MAX_REQUESTS_PER_WINDOW || "") || 100;
const requestCounts = new Map<string, number[]>();

function isRateLimited(ip: string | undefined): boolean {
  if (!ip) {
    return false; // Or handle missing IP as you see fit, e.g. reject
  }
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

interface CaptureOptions {
  width?: number;
  height?: number;
  scale?: number;
  fullPage?: boolean;
}

async function captureContent(
  url: string,
  type: "screenshot" | "pdf" = "screenshot",
  options: CaptureOptions = {}
): Promise<string | Buffer> {
  const browser: Browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({
      width: options.width || 1920,
      height: options.height || 1080,
      deviceScaleFactor: options.scale || 1,
    } as Viewport);

    // Navigate to URL with timeout
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for content to load
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const images = document.querySelectorAll("img");
        if (images.length === 0) {
          resolve();
          return;
        }

        let loadedImages = 0;
        images.forEach((img) => {
          if (img.complete) {
            loadedImages++;
          }
          img.addEventListener("load", () => {
            loadedImages++;
            if (loadedImages === images.length) {
              resolve();
            }
          });
          img.addEventListener("error", () => {
            loadedImages++;
            if (loadedImages === images.length) {
              resolve();
            }
          });
        });
      });
    });

    let result: string | Buffer;
    if (type === "pdf") {
      result = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
      } as PDFOptions);
    } else {
      result = (await page.screenshot({
        fullPage: options.fullPage ?? true, // Use nullish coalescing operator
        type: "png",
        encoding: "base64",
      })) as string;
    }

    return result;
  } finally {
    await browser.close();
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (isRateLimited(clientIP as string)) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  try {
    const { url, type = "screenshot", options = {} } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    if (!["screenshot", "pdf"].includes(type)) {
      return res
        .status(400)
        .json({ error: "Invalid type. Supported types: screenshot, pdf" });
    }

    const result = await captureContent(url, type, options);

    if (type === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="webpage.pdf"`
      );
      res.send(result);
    } else {
      res.status(200).json({
        success: true,
        data: {
          type: "screenshot",
          format: "base64",
          image: result,
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error("Screenshot/PDF Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
