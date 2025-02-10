import { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";
import { rateLimit } from "@/lib/rate-limit";
import { isValidUrl } from "@/lib/validation";

interface LoadedItem {
  structured: {
    title?: string;
    description?: string;
    link?: string;
    date?: string;
    author?: string;
  };
}

interface LoadedContent {
  clickCount: number;
  totalItems: number;
  items: LoadedItem[];
}

const MAX_OPERATION_TIME = 60000; // 60 seconds
const MAX_CONTENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ITEMS = 1000; // Maximum number of items to extract

// Stealth script to override navigator properties and hide automation
const STEALTH_SCRIPT = `
  Object.defineProperty(navigator, 'webdriver', { get: () => false });
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
  Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
  window.chrome = { runtime: {} };
  Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
`;

// Cookie consent handlers
const COOKIE_CONSENT_SELECTORS = [
  '[id*="cookie-consent"] button',
  '[class*="cookie-consent"] button',
  '[id*="cookie-banner"] button',
  '[class*="cookie-banner"] button',
  '[aria-label*="cookie"] button',
  'button[class*="accept"]',
  'button[class*="agree"]',
  'button[class*="consent"]',
];

async function loadDynamicContent(
  url: string,
  selector: string,
  maxClicks: number = 5,
  contentSelector?: string
): Promise<LoadedContent> {
  let browser = null;
  const operationStart = Date.now();

  try {
    if (!isValidUrl(url)) {
      throw new Error("Invalid URL provided");
    }

    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-infobars",
        "--window-size=1920,1080",
        "--start-maximized",
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

    // Set viewport to a common desktop resolution
    await page.setViewport({ width: 1920, height: 1080 });

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

    // Navigate with a longer timeout and wait for network idle
    await Promise.race([
      page.goto(url, {
        waitUntil: ["networkidle0", "domcontentloaded"],
        timeout: 30000,
      }),
      timeoutPromise,
    ]);

    // Wait for page to be fully loaded and interactive
    await Promise.race([
      page.waitForFunction(
        () => {
          return (
            document.readyState === "complete" &&
            !document.querySelector(
              'meta[name="robots"][content*="noindex"]'
            ) &&
            performance.timing.loadEventEnd > 0
          );
        },
        { timeout: 30000 }
      ),
      timeoutPromise,
    ]);

    // Initial scroll and wait
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(3000);

    // Handle cookie consent popups with improved detection
    for (const consentSelector of COOKIE_CONSENT_SELECTORS) {
      try {
        const button = await page.$(consentSelector);
        if (button) {
          const isVisible = await page.evaluate((el) => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            return (
              rect.width > 0 &&
              rect.height > 0 &&
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              style.opacity !== "0"
            );
          }, button);

          if (isVisible) {
            await button.click();
            await page.waitForTimeout(2000);
            break;
          }
        }
      } catch (e) {
        // Ignore errors if consent button not found
        console.warn("Error handling cookie consent:", e);
      }
    }

    // Function to check if an element is truly visible and clickable
    const isElementClickable = async (selector: string) => {
      const element = await page.$(selector);
      if (!element) return false;

      const isVisible = await page.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        // Check if element is in viewport
        const isInViewport =
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <=
            (window.innerWidth || document.documentElement.clientWidth);

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0" &&
          !el.hasAttribute("disabled") &&
          isInViewport
        );
      }, element);

      return isVisible;
    };

    // Function to wait for element to be clickable
    const waitForElementClickable = async (
      selector: string,
      timeout = 5000
    ) => {
      try {
        await page.waitForFunction(
          (sel) => {
            const el = document.querySelector(sel);
            if (!el) return false;

            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);

            const isInViewport =
              rect.top >= 0 &&
              rect.left >= 0 &&
              rect.bottom <=
                (window.innerHeight || document.documentElement.clientHeight) &&
              rect.right <=
                (window.innerWidth || document.documentElement.clientWidth);

            return (
              rect.width > 0 &&
              rect.height > 0 &&
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              style.opacity !== "0" &&
              !el.hasAttribute("disabled") &&
              isInViewport
            );
          },
          { timeout },
          selector
        );
        return true;
      } catch (e) {
        return false;
      }
    };

    // Function to attempt clicking with multiple strategies
    const attemptClick = async (selector: string): Promise<boolean> => {
      // Check operation timeout
      if (Date.now() - operationStart > MAX_OPERATION_TIME) {
        throw new Error("Operation timed out");
      }

      // Strategy 1: Native click with proper waiting
      try {
        if (await waitForElementClickable(selector)) {
          await page.click(selector);
          return true;
        }
      } catch (e) {
        console.warn("Native click failed:", e);
      }

      // Strategy 2: JavaScript click with focus and scroll
      try {
        await page.evaluate((sel) => {
          const element = document.querySelector(sel);
          if (element instanceof HTMLElement) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.focus();
            element.click();
            return true;
          }
          return false;
        }, selector);
        await page.waitForTimeout(1000);
        return true;
      } catch (e) {
        console.warn("JavaScript click failed:", e);
      }

      // Strategy 3: Mouse event simulation
      try {
        const element = await page.$(selector);
        if (element) {
          const box = await element.boundingBox();
          if (box) {
            await page.mouse.move(
              box.x + box.width / 2,
              box.y + box.height / 2
            );
            await page.mouse.down();
            await page.waitForTimeout(100);
            await page.mouse.up();
            await page.waitForTimeout(1000);
            return true;
          }
        }
      } catch (e) {
        console.warn("Mouse event simulation failed:", e);
      }

      return false;
    };

    // Function to check for new content
    const hasNewContent = async (prevCount: number): Promise<boolean> => {
      const newCount = await page.evaluate((sel) => {
        return document.querySelectorAll(sel).length;
      }, contentSelector || selector);

      return newCount > prevCount;
    };

    // Function to extract content
    const extractContent = async () => {
      const items = await page.evaluate((sel) => {
        const elements = document.querySelectorAll(sel);
        return Array.from(elements).map((el) => ({
          structured: {
            title: el
              .querySelector("h1, h2, h3, h4, h5, h6")
              ?.textContent?.trim(),
            description: el
              .querySelector("p, .description")
              ?.textContent?.trim(),
            link: el.querySelector("a")?.href,
            date:
              el.querySelector("time, [datetime]")?.getAttribute("datetime") ||
              undefined,
            author: el
              .querySelector('[rel="author"], .author')
              ?.textContent?.trim(),
          },
        }));
      }, contentSelector || selector);

      // Check content size limit
      const contentSize = JSON.stringify(items).length;
      if (contentSize > MAX_CONTENT_SIZE) {
        throw new Error("Content size limit exceeded");
      }

      // Check item count limit
      if (items.length > MAX_ITEMS) {
        throw new Error("Maximum item count exceeded");
      }

      return items as LoadedItem[];
    };

    let clickCount = 0;
    let prevItemCount = 0;
    let items: LoadedItem[] = [];

    // Initial content extraction
    items = await extractContent();
    prevItemCount = items.length;

    // Click and load more content
    while (clickCount < maxClicks) {
      // Check operation timeout
      if (Date.now() - operationStart > MAX_OPERATION_TIME) {
        break;
      }

      const clicked = await attemptClick(selector);
      if (!clicked) {
        break;
      }

      // Wait for new content
      await page.waitForTimeout(2000);
      const hasMore = await hasNewContent(prevItemCount);
      if (!hasMore) {
        break;
      }

      // Extract new content
      items = await extractContent();
      if (items.length <= prevItemCount) {
        break;
      }

      prevItemCount = items.length;
      clickCount++;
    }

    return {
      clickCount,
      totalItems: items.length,
      items,
    };
  } catch (error) {
    console.error("Dynamic content loading error:", error);
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

  const { url, selector, maxClicks } = req.body;

  if (!url || !selector) {
    return res.status(400).json({ error: "URL and selector are required" });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL provided" });
  }

  const parsedMaxClicks = parseInt(maxClicks);
  if (isNaN(parsedMaxClicks) || parsedMaxClicks < 1 || parsedMaxClicks > 20) {
    return res
      .status(400)
      .json({ error: "maxClicks must be between 1 and 20" });
  }

  try {
    const data = await loadDynamicContent(url, selector, parsedMaxClicks);
    return res.status(200).json({ data });
  } catch (error) {
    console.error("Dynamic content error:", error);

    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        return res.status(504).json({ error: "Operation timed out" });
      }
      if (error.message.includes("size limit")) {
        return res.status(413).json({ error: "Content size limit exceeded" });
      }
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "Failed to load dynamic content" });
  }
}

export default handler;
