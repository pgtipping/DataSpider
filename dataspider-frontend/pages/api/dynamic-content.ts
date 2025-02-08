import { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";
import { withRateLimit } from "@/lib/rate-limit";

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
  const browser = await puppeteer.launch({
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

  try {
    const page = await browser.newPage();

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

    // Navigate with a longer timeout and wait for network idle
    await page.goto(url, {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 30000,
    });

    // Wait for page to be fully loaded and interactive
    await page.waitForFunction(
      () => {
        return (
          document.readyState === "complete" &&
          !document.querySelector('meta[name="robots"][content*="noindex"]') &&
          performance.timing.loadEventEnd > 0
        );
      },
      { timeout: 30000 }
    );

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
      // Strategy 1: Native click with proper waiting
      try {
        if (await waitForElementClickable(selector)) {
          await page.click(selector);
          return true;
        }
      } catch (e) {
        console.log("Native click failed");
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
        console.log("JavaScript click failed");
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
            return true;
          }
        }
      } catch (e) {
        console.log("Mouse event simulation failed");
      }

      return false;
    };

    // Function to check for new content
    const hasNewContent = async (prevCount: number): Promise<boolean> => {
      try {
        const newCount = await page.evaluate((contentSel) => {
          const elements = contentSel
            ? document.querySelectorAll(contentSel)
            : document.querySelectorAll(
                "article, .post, .card, .item, .entry, .article"
              );
          return elements.length;
        }, contentSelector);

        return newCount > prevCount;
      } catch (e) {
        return false;
      }
    };

    // Function to extract structured content
    const extractContent = async () => {
      return page.evaluate((contentSelector: string | undefined) => {
        const elements = contentSelector
          ? document.querySelectorAll(contentSelector)
          : document.querySelectorAll(
              "article, .post, .card, .item, .entry, .article"
            );

        return Array.from(elements).map((el) => {
          const structured: any = {};

          // Title extraction with improved selectors
          const titleEl = el.querySelector(
            "h1, h2, h3, h4, .title, [class*='title'], [class*='heading'], a[class*='title'], .post-title, .entry-title, [data-testid*='title']"
          );
          if (titleEl) {
            structured.title = titleEl.textContent?.trim();
          }

          // Description extraction with improved selectors
          const descEl = el.querySelector(
            "p, .description, .excerpt, .summary, [class*='desc'], [class*='text'], .post-excerpt, .entry-content, [data-testid*='description']"
          );
          if (descEl) {
            structured.description = descEl.textContent?.trim();
          }

          // Link extraction with improved handling
          const linkEl = el.querySelector("a[href]") || el.closest("a[href]");
          if (linkEl instanceof HTMLAnchorElement && linkEl.href) {
            structured.link = linkEl.href;
          }

          // Date extraction with improved selectors
          const dateEl = el.querySelector(
            "time, .date, .timestamp, [datetime], [class*='date'], [class*='time'], .post-date, .entry-date, [data-testid*='date']"
          );
          if (dateEl) {
            structured.date =
              dateEl.getAttribute("datetime") || dateEl.textContent?.trim();
          }

          // Author extraction with improved selectors
          const authorEl = el.querySelector(
            ".author, .byline, [class*='author'], [rel='author'], [class*='by'], .post-author, .entry-author, [data-testid*='author']"
          );
          if (authorEl) {
            structured.author = authorEl.textContent?.trim();
          }

          return { structured };
        });
      }, contentSelector);
    };

    let clickCount = 0;
    const items = new Set<string>();
    let lastItemCount = 0;

    // Get initial content
    const initialItems = await extractContent();
    initialItems.forEach((item) => {
      if (item.structured.title || item.structured.description) {
        items.add(JSON.stringify(item));
      }
    });
    lastItemCount = items.size;

    // Click loop with improved detection and waiting
    while (clickCount < maxClicks) {
      try {
        // Scroll and wait
        await page.evaluate(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          });
        });
        await page.waitForTimeout(2000);

        // Check if button exists and is clickable
        if (!(await isElementClickable(selector))) {
          console.log("Button not clickable, trying to scroll up");
          await page.evaluate(() => {
            window.scrollBy(0, -300);
          });
          await page.waitForTimeout(1000);

          if (!(await isElementClickable(selector))) {
            console.log("Button still not clickable after scroll adjustment");
            break;
          }
        }

        // Attempt to click the button
        const clickSuccess = await attemptClick(selector);
        if (!clickSuccess) {
          console.log("All click attempts failed");
          break;
        }

        clickCount++;
        console.log(`Successfully clicked ${clickCount} times`);

        // Wait for new content with better detection
        let newContentFound = false;
        for (let i = 0; i < 5; i++) {
          await page.waitForTimeout(2000);
          if (await hasNewContent(lastItemCount)) {
            newContentFound = true;
            break;
          }
        }

        if (!newContentFound) {
          console.log("No new content detected after click");
          break;
        }

        // Extract and process new content
        const newItems = await extractContent();
        let newItemsFound = false;

        newItems.forEach((item) => {
          if (item.structured.title || item.structured.description) {
            const itemString = JSON.stringify(item);
            if (!items.has(itemString)) {
              items.add(itemString);
              newItemsFound = true;
            }
          }
        });

        if (!newItemsFound) {
          console.log("No new unique items found");
          break;
        }

        lastItemCount = items.size;
        await page.waitForTimeout(2000);
      } catch (error) {
        console.log("Click attempt failed:", error);
        break;
      }
    }

    const uniqueItems = Array.from(items)
      .map((item) => JSON.parse(item))
      .filter((item) => item.structured.title || item.structured.description);

    return {
      clickCount,
      totalItems: uniqueItems.length,
      items: uniqueItems,
    };
  } finally {
    await browser.close();
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, selector, maxClicks = 5, contentSelector } = req.body;

  if (!url || !selector) {
    return res.status(400).json({ error: "URL and selector are required" });
  }

  if (maxClicks > 20) {
    return res.status(400).json({ error: "Maximum 20 clicks allowed" });
  }

  try {
    const result = await loadDynamicContent(
      url,
      selector,
      maxClicks,
      contentSelector
    );
    return res.status(200).json({ data: result });
  } catch (error) {
    console.error("Dynamic content loading error:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to load dynamic content",
    });
  }
}

export default withRateLimit(handler);
