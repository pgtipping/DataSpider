import { JSDOM } from "jsdom";

async function getJSDOM() {
  const { JSDOM } = await import("jsdom");
  return JSDOM;
}

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing URL parameter" });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const JSDOM = await getJSDOM();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    console.log("HTML Content:", html);

    // Improved selectors
    const title =
      document.querySelector("#productTitle")?.textContent?.trim() ||
      document.querySelector("#title")?.textContent?.trim() ||
      "";
    const price =
      document.querySelector(".a-price .a-offscreen")?.textContent?.trim() ||
      document.querySelector(".price_color")?.textContent?.trim() ||
      "";

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.status(200).json({ title, price });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
