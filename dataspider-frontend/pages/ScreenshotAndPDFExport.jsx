"use client";

import React, { useState } from "react";

const ScreenshotAndPDFExport = () => {
  const [url, setUrl] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchScreenshotAndPdf = async () => {
    setLoading(true);
    setError(null);
    setScreenshotUrl(null);
    setPdfUrl(null);

    try {
      const response = await fetch("/api/screenshot-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setScreenshotUrl(data.screenshotUrl);
      setPdfUrl(data.pdfUrl);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchScreenshotAndPdf();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">
        Screenshot and PDF Export
      </h1>
      <p className="text-xl text-center mb-12">
        Capture full-page screenshots and export web content to PDF.
      </p>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">
          Screenshot and PDF Export
        </h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-2">
            <label
              htmlFor="url"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              URL:
            </label>
            <input
              type="url"
              id="url"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white rounded p-2 mt-2"
            disabled={loading}
          >
            {loading ? "Processing..." : "Generate"}
          </button>
        </form>

        {error && <p className="text-red-500">Error: {error.message}</p>}

        {screenshotUrl && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Screenshot:</h3>
            <img src={screenshotUrl} alt="Screenshot" className="max-w-full" />
          </div>
        )}

        {pdfUrl && (
          <div>
            <h3 className="text-xl font-semibold mb-2">PDF:</h3>
            <a
              href={pdfUrl}
              className="text-blue-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenshotAndPDFExport;
