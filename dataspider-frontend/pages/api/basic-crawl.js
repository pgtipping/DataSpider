import { chromium } from "playwright";

export default async function handler(req, res) {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
    const content = await page.content();
    await browser.close();

    res.status(200).send(content);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
