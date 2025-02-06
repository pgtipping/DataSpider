import { AsyncWebCrawler } from "@modelcontextprotocol/sdk";

export default async function handler(req, res) {
  const { urls } = req.query;

  if (!urls) {
    return res.status(400).json({ error: "Missing URLs parameter" });
  }

  const urlList = urls.split(",").map((url) => url.trim());

  try {
    const crawler = new AsyncWebCrawler();
    const results = await crawler.arun_many((urls = urlList));
    await crawler.close();

    const formattedResults = results.map((result) => ({
      url: result.url,
      success: result.success,
      title: result.metadata?.title || null,
      wordCount: result.markdown?.split(/\s+/).length || 0, // Count words in markdown
      links: result.links || null,
      images: result.media?.images || null,
      error: result.error_message || null,
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
