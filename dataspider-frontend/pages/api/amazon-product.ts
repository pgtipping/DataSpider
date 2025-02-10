import { NextApiRequest, NextApiResponse } from "next";
import { JSDOM } from "jsdom";
import { rateLimit } from "@/lib/rate-limit";
import { isValidUrl } from "@/lib/validation";

interface ProductData {
  title: string;
  price: string;
  rating: string;
  reviewCount: string;
  brand: string;
  availability: string;
  description: string;
  features: string[];
  images: string[];
  specifications: Record<string, string>;
  variants: string[];
  categories: string[];
}

const MAX_CONTENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_OPERATION_TIME = 60000; // 60 seconds

// Selectors for product information
const SELECTORS = {
  title: ["#productTitle", ".product-title", '[data-feature-name="title"]'],
  price: [
    ".a-price .a-offscreen",
    "#priceblock_ourprice",
    "#priceblock_dealprice",
    "#priceblock_saleprice",
    ".price-large",
  ],
  rating: [
    ".a-icon-star-small",
    "#acrPopover",
    '[data-feature-name="averageStarRating"]',
  ],
  reviewCount: ["#acrCustomerReviewText", '[data-feature-name="reviewCount"]'],
  brand: ["#bylineInfo", ".product-by-line", '[data-feature-name="brandLogo"]'],
  availability: [
    "#availability",
    "#availability-string",
    "#outOfStock",
    "#inStock",
  ],
  description: [
    "#productDescription",
    "#feature-bullets",
    ".product-description",
  ],
  features: [
    "#feature-bullets li",
    ".a-unordered-list li",
    ".product-features li",
  ],
  images: ["#altImages img", "#imageBlock img", ".imgTagWrapper img"],
  specifications: [
    "#productDetails_techSpec_section_1 tr",
    "#prodDetails tr",
    ".product-specifications tr",
  ],
  variants: [
    "#variation_color_name li",
    "#variation_size_name li",
    "#variation_style_name li",
  ],
  categories: ["#wayfinding-breadcrumbs_feature_div li", ".a-breadcrumb li"],
};

function cleanText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/[\s\n\r]+/g, " ")
    .trim()
    .replace(/[^\x20-\x7E]/g, ""); // Remove non-printable characters
}

function findElement(document: Document, selectors: string[]): Element | null {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }
  return null;
}

function findElements(document: Document, selectors: string[]): Element[] {
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) return Array.from(elements);
  }
  return [];
}

async function extractProductData(url: string): Promise<ProductData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MAX_OPERATION_TIME);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
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
    const dom = new JSDOM(html, {
      url,
      referrer: url,
      contentType: "text/html",
      includeNodeLocations: false,
      storageQuota: 10000000, // 10MB
    });

    const document = dom.window.document;

    // Extract product information using multiple selectors
    const title = cleanText(
      findElement(document, SELECTORS.title)?.textContent
    );
    const price = cleanText(
      findElement(document, SELECTORS.price)?.textContent
    );
    const rating = cleanText(
      findElement(document, SELECTORS.rating)?.textContent
    );
    const reviewCount = cleanText(
      findElement(document, SELECTORS.reviewCount)?.textContent
    );
    const brand = cleanText(
      findElement(document, SELECTORS.brand)?.textContent
    );
    const availability = cleanText(
      findElement(document, SELECTORS.availability)?.textContent
    );
    const description = cleanText(
      findElement(document, SELECTORS.description)?.textContent
    );

    // Extract features
    const features = findElements(document, SELECTORS.features)
      .map((el) => cleanText(el.textContent))
      .filter(Boolean);

    // Extract images
    const images = findElements(document, SELECTORS.images)
      .map((img) => (img as HTMLImageElement).src)
      .filter((src) => src && !src.includes("sprite"))
      .map((src) => {
        try {
          return new URL(src, url).toString();
        } catch {
          return "";
        }
      })
      .filter(Boolean);

    // Extract specifications
    const specifications: Record<string, string> = {};
    findElements(document, SELECTORS.specifications).forEach((row) => {
      const label = cleanText(
        row.querySelector("th, td:first-child")?.textContent
      );
      const value = cleanText(row.querySelector("td:last-child")?.textContent);
      if (label && value) {
        specifications[label] = value;
      }
    });

    // Extract variants
    const variants = findElements(document, SELECTORS.variants)
      .map((el) => cleanText(el.textContent))
      .filter(Boolean);

    // Extract categories
    const categories = findElements(document, SELECTORS.categories)
      .map((el) => cleanText(el.textContent))
      .filter(Boolean);

    if (!title) {
      throw new Error("Failed to extract product title");
    }

    return {
      title,
      price,
      rating,
      reviewCount,
      brand,
      availability,
      description,
      features,
      images,
      specifications,
      variants,
      categories,
    };
  } catch (error) {
    console.error("Product extraction error:", error);
    throw error;
  }
}

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500,
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Apply rate limiting
    await limiter.check(res, 2, "CACHE_TOKEN"); // 2 requests per minute per IP
  } catch {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  const url = req.method === "GET" ? (req.query.url as string) : req.body.url;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Amazon product URL is required" });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL provided" });
  }

  if (
    !url.includes("amazon.com") ||
    !url.includes("/dp/") ||
    !url.match(/\/dp\/[A-Z0-9]{10}/)
  ) {
    return res.status(400).json({
      error:
        "Only valid Amazon.com product URLs are supported (must include /dp/ASIN)",
    });
  }

  try {
    const productData = await extractProductData(url);
    return res.status(200).json({ data: productData });
  } catch (error) {
    console.error("Product extraction error:", error);

    if (error instanceof Error) {
      if (error.message.includes("timeout") || error.name === "AbortError") {
        return res.status(504).json({ error: "Operation timed out" });
      }
      if (error.message.includes("size limit")) {
        return res.status(413).json({ error: "Content size limit exceeded" });
      }
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: "Failed to extract product data" });
  }
}

export default handler;
