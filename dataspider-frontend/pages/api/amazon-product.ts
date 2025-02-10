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
  title: [
    "#productTitle",
    ".product-title-word-break",
    '[data-feature-name="title"]',
    'h1[class*="title"]',
  ],
  price: [
    'span.a-price span[aria-hidden="true"]',
    "span.a-price .a-offscreen",
    "#corePrice_feature_div .a-price .a-offscreen",
    "#priceblock_ourprice",
    "#priceblock_dealprice",
    "#price_inside_buybox",
    ".a-price-whole",
    ".a-color-price",
  ],
  rating: [
    "#averageCustomerReviews .a-icon-star .a-icon-alt",
    "#acrPopover .a-icon-alt",
    'span[data-hook="rating-out-of-text"]',
    'i[data-hook="average-star-rating"]',
  ],
  reviewCount: [
    "#acrCustomerReviewText",
    "#reviewsMedley .a-size-base",
    'span[data-hook="total-review-count"]',
  ],
  brand: [
    "#bylineInfo",
    "#brand",
    ".po-brand .a-span9",
    "a#bylineInfo",
    ".a-row.po-brand span.a-size-base",
  ],
  availability: [
    "#availability span",
    "#outOfStock",
    ".a-box-inner .a-color-success",
    "#deliveryMessageMirId",
    '[data-csa-c-type="widget"] .a-box-inner',
  ],
  description: [
    "#productDescription",
    "#feature-bullets",
    "#aplus",
    ".aplus-v2",
    ".description",
  ],
  features: [
    "#feature-bullets ul li:not(.aok-hidden)",
    ".a-unordered-list:not(.a-spacing-none) .a-list-item",
    '[data-feature-name="featurebullets"] span.a-list-item',
  ],
  images: [
    "#landingImage",
    "#imgBlkFront",
    "#main-image",
    ".imgTagWrapper img",
    "#imageBlock img:not(.a-hidden)",
  ],
  specifications: [
    "#productDetails_techSpec_section_1 tr",
    "#prodDetails tr",
    "#detailBullets_feature_div li",
    "#technicalSpecifications_section_1 tr",
  ],
  variants: [
    "#variation_color_name li",
    "#variation_size_name li",
    "#variation_style_name li",
    ".variation-dropdown",
  ],
  categories: [
    "#wayfinding-breadcrumbs_container li",
    ".a-breadcrumb li span.a-list-item",
    "#nav-subnav .nav-a-content",
  ],
  reviews: [
    '#cm-cr-dp-review-list div[data-hook="review"]',
    '#customer-reviews-content div[data-hook="review"]',
    '.review-views-content div[data-hook="review"]',
  ],
  reviewFeatures: [
    "#feature-bullets .a-list-item",
    "#feature-bullets li:not(.aok-hidden)",
    ".a-unordered-list .a-list-item:not(.aok-hidden)",
    '[data-feature-name="featurebullets"] .a-list-item',
  ],
};

function cleanText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/[\s\n\r]+/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/javascript:.*/g, "")
    .replace(/var metricsName.*/g, "")
    .replace(/function\s*\{.*\}/g, "")
    .trim();
}

function cleanPrice(price: string): string {
  if (!price) return "";
  // Remove currency symbols and normalize
  const cleaned = price.replace(/[^\d.,]/g, "").trim();
  // Handle different price formats
  if (cleaned.includes(",") && cleaned.includes(".")) {
    // Format like 1,234.56
    return cleaned.replace(",", "");
  }
  return cleaned;
}

function cleanReviewCount(count: string): string {
  const matches = count.match(/[\d,]+/);
  return matches ? matches[0] : "";
}

function cleanRating(rating: string): string {
  const matches = rating.match(/[\d.]+/);
  return matches ? matches[0] + " out of 5 stars" : "";
}

function extractReviews(document: Document): {
  reviews: string[];
  topFeatures: string[];
} {
  const reviews: string[] = [];
  const topFeaturesSet = new Set<string>();

  // Extract reviews with better formatting
  const reviewElements = findElements(document, SELECTORS.reviews);
  reviewElements.forEach((review) => {
    const rating = review.querySelector(
      '[data-hook="review-star-rating"], [data-hook="cmps-review-star-rating"]'
    )?.textContent;
    const title = review.querySelector(
      '[data-hook="review-title"], .review-title'
    )?.textContent;
    const author = review.querySelector(".a-profile-name")?.textContent;
    const date = review.querySelector('[data-hook="review-date"]')?.textContent;
    const body = review.querySelector(
      '[data-hook="review-body"], .review-text'
    )?.textContent;
    const verified = review.querySelector(".avp-badge")?.textContent;

    if (rating && body) {
      const reviewText = [
        `${cleanText(rating)} - ${cleanText(title || "")}`,
        `By ${cleanText(author || "Anonymous")} on ${cleanText(date || "")}`,
        verified ? "Verified Purchase" : "",
        cleanText(body),
      ]
        .filter(Boolean)
        .join("\n");

      reviews.push(reviewText);

      // Extract key features mentioned in positive reviews
      if (rating.includes("5.0") || rating.includes("4.0")) {
        const features = body.match(
          /(?:great|good|excellent|love|perfect)\s+([^.!?]+)[.!?]/gi
        );
        features?.forEach((f) => topFeaturesSet.add(cleanText(f)));
      }
    }
  });

  return {
    reviews: reviews.slice(0, 10), // Get top 10 most helpful reviews
    topFeatures: Array.from(topFeaturesSet).slice(0, 5), // Top 5 mentioned features
  };
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

    // Extract basic information with improved cleaning
    const title = cleanText(
      findElement(document, SELECTORS.title)?.textContent
    );
    let price = "";
    for (const selector of SELECTORS.price) {
      const priceElement = document.querySelector(selector);
      if (priceElement?.textContent) {
        price = cleanPrice(priceElement.textContent);
        if (price) break;
      }
    }
    const ratingElement = findElement(document, SELECTORS.rating);
    const rating = ratingElement
      ? cleanRating(ratingElement.textContent || "")
      : "";
    const reviewCountElement = findElement(document, SELECTORS.reviewCount);
    const reviewCount = reviewCountElement
      ? cleanReviewCount(reviewCountElement.textContent || "")
      : "";

    // Extract brand with fallback
    let brand = cleanText(findElement(document, SELECTORS.brand)?.textContent);
    if (!brand) {
      const brandMeta = document.querySelector('meta[name="brand"]');
      brand = brandMeta ? cleanText(brandMeta.getAttribute("content")) : "";
    }

    // Extract availability with delivery info
    const availabilityElement = findElement(document, SELECTORS.availability);
    let availability = cleanText(availabilityElement?.textContent);
    const deliveryElement = document.querySelector("#deliveryMessageMirId");
    if (deliveryElement) {
      availability += " " + cleanText(deliveryElement.textContent);
    }

    // Extract description with combined content
    const descriptionParts = SELECTORS.description
      .map((selector) =>
        cleanText(document.querySelector(selector)?.textContent)
      )
      .filter(Boolean);
    const description = descriptionParts.join("\n\n");

    // Extract regular product features
    const productFeatures = findElements(document, SELECTORS.reviewFeatures)
      .map((el) => cleanText(el.textContent))
      .filter(
        (text) =>
          text &&
          !text.includes("var metrics") &&
          !text.includes("function") &&
          !text.includes("javascript:") &&
          !text.includes("star") // Remove star ratings from features
      );

    // Extract high-quality images
    const images = findElements(document, SELECTORS.images)
      .map((img) => {
        const src = (img as HTMLImageElement).src;
        // Try to get high-resolution version
        return src.replace(/\._.*_\./, ".");
      })
      .filter(
        (src) =>
          src && !src.includes("sprite") && !src.includes("transparent-pixel")
      );

    // Extract specifications with better organization
    const specifications: Record<string, string> = {};
    findElements(document, SELECTORS.specifications).forEach((row) => {
      const label = cleanText(
        row.querySelector("th, .a-text-right, .a-key")?.textContent
      );
      const value = cleanText(
        row.querySelector("td, .a-text-left, .a-value")?.textContent
      );
      if (label && value) {
        specifications[label] = value;
      }
    });

    // Extract variants with better organization
    const variants = findElements(document, SELECTORS.variants)
      .map((el) => cleanText(el.textContent))
      .filter(Boolean);

    // Extract categories with breadcrumb handling
    const categories = findElements(document, SELECTORS.categories)
      .map((el) => cleanText(el.textContent))
      .filter(Boolean);

    // Extract reviews and mentioned features
    const { reviews, topFeatures } = extractReviews(document);

    // Organize features properly
    const features = [
      ...new Set([
        ...productFeatures.filter((f) => !f.includes("star")),
        ...topFeatures,
      ]),
    ];

    // Add reviews to specifications
    if (reviews.length > 0) {
      specifications["Customer Reviews"] = reviews.join("\n\n---\n\n");
    }

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
