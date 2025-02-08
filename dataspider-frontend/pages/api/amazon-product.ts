import { NextApiRequest, NextApiResponse } from "next";
import { JSDOM } from "jsdom";
import { withRateLimit } from "@/lib/rate-limit";

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
}

async function extractProductData(url: string): Promise<ProductData> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "DataSpider/1.0 (Educational Purpose)",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Extract product information
  const title =
    document.querySelector("#productTitle")?.textContent?.trim() || "";
  const price =
    document.querySelector(".a-price .a-offscreen")?.textContent?.trim() || "";
  const rating =
    document.querySelector(".a-icon-star-small")?.textContent?.trim() || "";
  const reviewCount =
    document.querySelector("#acrCustomerReviewText")?.textContent?.trim() || "";
  const brand =
    document.querySelector("#bylineInfo")?.textContent?.trim() || "";
  const availability =
    document.querySelector("#availability")?.textContent?.trim() || "";
  const description =
    document.querySelector("#productDescription")?.textContent?.trim() || "";

  // Extract features
  const features = Array.from(document.querySelectorAll("#feature-bullets li"))
    .map((li) => (li as HTMLElement).textContent?.trim() || "")
    .filter(Boolean);

  // Extract images
  const images = Array.from(document.querySelectorAll("#altImages img"))
    .map((img) => (img as HTMLImageElement).src)
    .filter((src) => src && !src.includes("sprite"));

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
  };
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Amazon product URL is required" });
  }

  if (!url.includes("amazon.com")) {
    return res
      .status(400)
      .json({ error: "Only Amazon.com URLs are supported" });
  }

  try {
    const productData = await extractProductData(url);
    return res.status(200).json({ data: productData });
  } catch (error) {
    console.error("Product extraction error:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to extract product data",
    });
  }
}

export default withRateLimit(handler);
