import { chromium } from "playwright";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { url, clickingMode } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Missing URL parameter" });
    }

    try {
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded" });

      let content = "";

      if (clickingMode === "step-by-step") {
        // Step-by-step clicking
        const buttons = await page.$$("button, a");
        for (const button of buttons) {
          try {
            await button.click();
            await page.waitForTimeout(1000); // Wait for content to load
            content = await page.content();
          } catch (e) {
            console.log("Error clicking button", e);
          }
        }
      } else if (clickingMode === "single-call") {
        // Single-call clicking
        const buttons = await page.$$("button, a");
        for (const button of buttons) {
          try {
            await button.click();
          } catch (e) {
            console.log("Error clicking button", e);
          }
        }
        await page.waitForTimeout(3000); // Wait for content to load
        content = await page.content();
      }

      await browser.close();
      res.status(200).send(content);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
