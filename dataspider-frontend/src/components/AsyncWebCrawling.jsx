"use client";

import { useState } from "react";

const AsyncWebCrawling = () => {
  const [urls, setUrls] = useState("");
  const [crawledData, setCrawledData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCrawledData = async () => {
    setLoading(true);
    setError(null);
    setCrawledData([]);

    try {
      const urlList = urls.split(",").map((url) => url.trim());
      const promises = urlList.map(async (url) => {
        try {
          const response = await fetch(`/api/crawl?url=${url}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return { url, data: await response.text() };
        } catch (err) {
          console.error(`Failed to fetch ${url}: ${err.message}`);
          return { url, data: `Failed to fetch ${url}: ${err.message}` };
        }
      });

      const results = await Promise.all(promises);
      setCrawledData(results);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchCrawledData();
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Asynchronous Web Crawling</h2>
      <p>Crawl multiple URLs concurrently for enhanced efficiency.</p>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Enter URLs separated by commas (e.g., https://www.amazon.com, https://www.google.com)"
          className="border rounded p-2 w-full"
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded p-2 mt-2"
          disabled={loading}
        >
          {loading ? "Crawling..." : "Crawl"}
        </button>
      </form>

      {error && <p className="text-red-500">Error: {error.message}</p>}

      {crawledData.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Crawled Data:</h3>
          {crawledData.map((item, index) => {
            const bodyContent =
              item.data.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ||
              item.data;
            return (
              <div key={index} className="mb-4">
                <h4 className="font-semibold">URL: {item.url}</h4>
                <div
                  className="border rounded p-2 overflow-auto"
                  dangerouslySetInnerHTML={{ __html: bodyContent }}
                  style={{ wordWrap: "break-word" }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AsyncWebCrawling;
