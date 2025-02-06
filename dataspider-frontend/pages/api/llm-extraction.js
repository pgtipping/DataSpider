export default async function handler(req, res) {
  if (req.method === "POST") {
    const { text, format } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text parameter" });
    }

    // Simulate LLM extraction
    const extractedData = {
      inputText: text,
      inputFormat: format,
      extractedInfo: "This is a simulation of extracted data from the LLM.",
    };

    res.status(200).json(extractedData);
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
