import { chromium } from "playwright";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Missing URL parameter" });
    }

    try {
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded" });

      const screenshotBuffer = await page.screenshot({ fullPage: true });
      const pdfBuffer = await page.pdf({ format: "A4" });

      await browser.close();

      // Convert buffers to data URLs
      const screenshotBase64 = screenshotBuffer.toString("base64");
      const screenshotUrl = `data:image/png;base64,${screenshotBase64}`;
      const pdfBase64 = pdfBuffer.toString("base64");
      const pdfUrl = `data:application/pdf;base64,${pdfBase64}`;

      res.status(200).json({ screenshotUrl, pdfUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
