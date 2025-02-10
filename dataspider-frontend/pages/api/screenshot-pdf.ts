import puppeteer, {
  Browser,
  PDFOptions,
  PuppeteerLaunchOptions,
  Viewport,
} from "puppeteer";
import { NextApiRequest, NextApiResponse } from "next";
import { rateLimit } from "@/lib/rate-limit";
import { isValidUrl } from "@/lib/validation";

interface CaptureOptions {
  width?: number;
  height?: number;
  scale?: number;
  fullPage?: boolean;
}

const MAX_OPERATION_TIME = 60000; // 60 seconds
const MAX_CONTENT_SIZE = 50 * 1024 * 1024; // 50MB for PDFs
const MAX_VIEWPORT_WIDTH = 3840; // 4K
const MAX_VIEWPORT_HEIGHT = 2160; // 4K
const MAX_SCALE_FACTOR = 3;

// Stealth script to override navigator properties and hide automation
const STEALTH_SCRIPT = `
  Object.defineProperty(navigator, 'webdriver', { get: () => false });
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
  Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
  window.chrome = { runtime: {} };
  Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
`;

async function captureContent(
  url: string,
  type: "screenshot" | "pdf" = "screenshot",
  options: CaptureOptions = {}
): Promise<string | Buffer> {
  let browser: Browser | null = null;
  const operationStart = Date.now();

  try {
    if (!isValidUrl(url)) {
      throw new Error("Invalid URL provided");
    }

    // Validate and sanitize options
    const width = Math.min(
      Math.max(options.width || 1920, 320),
      MAX_VIEWPORT_WIDTH
    );
    const height = Math.min(
      Math.max(options.height || 1080, 240),
      MAX_VIEWPORT_HEIGHT
    );
    const scale = Math.min(Math.max(options.scale || 1, 0.1), MAX_SCALE_FACTOR);
    const fullPage = options.fullPage ?? true;

    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-infobars",
        `--window-size=${width},${height}`,
      ],
    });

    const page = await browser.newPage();

    // Set up content size monitoring
    let totalContentSize = 0;
    page.on("response", async (response) => {
      const contentLength = parseInt(
        response.headers()["content-length"] || "0"
      );
      totalContentSize += contentLength;
      if (totalContentSize > MAX_CONTENT_SIZE) {
        throw new Error("Content size limit exceeded");
      }
    });

    // Set a more realistic user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Set viewport
    await page.setViewport({
      width,
      height,
      deviceScaleFactor: scale,
    } as Viewport);

    // Inject stealth scripts
    await page.evaluateOnNewDocument(STEALTH_SCRIPT);

    // Add human-like behaviors
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    });

    // Set up operation timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Operation timed out"));
      }, MAX_OPERATION_TIME);
    });

    // Navigate to URL with timeout
    await Promise.race([
      page.goto(url, {
        waitUntil: ["networkidle0", "domcontentloaded"],
        timeout: 30000,
      }),
      timeoutPromise,
    ]);

    // Wait for content to load
    await Promise.race([
      page.evaluate(() => {
        return new Promise<void>((resolve) => {
          const images = document.querySelectorAll("img");
          if (images.length === 0) {
            resolve();
            return;
          }

          let loadedImages = 0;
          const totalImages = images.length;
          const imageTimeout = setTimeout(() => resolve(), 10000); // 10s timeout for images

          images.forEach((img) => {
            if (img.complete) {
              loadedImages++;
              if (loadedImages === totalImages) {
                clearTimeout(imageTimeout);
                resolve();
              }
            }
            img.addEventListener("load", () => {
              loadedImages++;
              if (loadedImages === totalImages) {
                clearTimeout(imageTimeout);
                resolve();
              }
            });
            img.addEventListener("error", () => {
              loadedImages++;
              if (loadedImages === totalImages) {
                clearTimeout(imageTimeout);
                resolve();
              }
            });
          });
        });
      }),
      timeoutPromise,
    ]);

    // Remove cookie banners and other overlays
    await page.evaluate(() => {
      const selectors = [
        '[class*="cookie"]',
        '[id*="cookie"]',
        '[class*="popup"]',
        '[id*="popup"]',
        '[class*="modal"]',
        '[id*="modal"]',
        '[class*="overlay"]',
        '[id*="overlay"]',
      ];
      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.display = "none";
          }
        });
      });
    });

    let result: string | Buffer;
    if (type === "pdf") {
      result = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
        preferCSSPageSize: true,
        scale: 1,
      } as PDFOptions);

      // Check PDF size
      if (result.length > MAX_CONTENT_SIZE) {
        throw new Error("PDF size limit exceeded");
      }
    } else {
      result = (await page.screenshot({
        fullPage,
        type: "png",
        encoding: "base64",
        optimizeForSpeed: true,
      })) as string;

      // Check screenshot size (base64 is 4/3 times larger than binary)
      if ((result.length * 3) / 4 > MAX_CONTENT_SIZE) {
        throw new Error("Screenshot size limit exceeded");
      }
    }

    return result;
  } catch (error) {
    console.error("Capture error:", error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error("Error closing browser:", e);
      }
    }
  }
}

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Apply rate limiting
    await limiter.check(res, 5, "CACHE_TOKEN"); // 5 requests per minute per IP
  } catch {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  try {
    const { url, type = "screenshot", options = {} } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: "Invalid URL provided" });
    }

    if (!["screenshot", "pdf"].includes(type)) {
      return res
        .status(400)
        .json({ error: "Invalid type. Supported types: screenshot, pdf" });
    }

    // Validate options
    if (
      options.width &&
      (options.width < 320 || options.width > MAX_VIEWPORT_WIDTH)
    ) {
      return res.status(400).json({
        error: `Width must be between 320 and ${MAX_VIEWPORT_WIDTH} pixels`,
      });
    }

    if (
      options.height &&
      (options.height < 240 || options.height > MAX_VIEWPORT_HEIGHT)
    ) {
      return res.status(400).json({
        error: `Height must be between 240 and ${MAX_VIEWPORT_HEIGHT} pixels`,
      });
    }

    if (
      options.scale &&
      (options.scale < 0.1 || options.scale > MAX_SCALE_FACTOR)
    ) {
      return res.status(400).json({
        error: `Scale factor must be between 0.1 and ${MAX_SCALE_FACTOR}`,
      });
    }

    const result = await captureContent(url, type, options);

    if (type === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="webpage.pdf"`
      );
      res.setHeader("Content-Length", result.length);
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
  } catch (error) {
    console.error("Screenshot/PDF Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        return res.status(504).json({
          success: false,
          error: "Operation timed out",
          timestamp: new Date().toISOString(),
        });
      }
      if (error.message.includes("size limit")) {
        return res.status(413).json({
          success: false,
          error: "Content size limit exceeded",
          timestamp: new Date().toISOString(),
        });
      }
      return res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to capture content",
      timestamp: new Date().toISOString(),
    });
  }
}
