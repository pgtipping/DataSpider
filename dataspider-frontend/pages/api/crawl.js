import { chromium } from "playwright";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing URL parameter" });
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const content = await page.content();
    await browser.close();

    res.status(200).send(content);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
