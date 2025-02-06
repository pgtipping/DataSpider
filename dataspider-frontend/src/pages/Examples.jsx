import React from "react";
import Link from "next/link";

const ExamplesPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Examples</h1>
      <p className="text-xl text-center mb-12">
        Explore the capabilities of DataSpider with these examples.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            <Link
              href="/BasicWebCrawling"
              className="text-blue-500 hover:underline"
            >
              Hello, World!
            </Link>
          </h2>
          <p>This is a basic example demonstrating a simple crawl.</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            <Link
              href="/AmazonProductExtraction"
              className="text-blue-500 hover:underline"
            >
              Amazon Product Extraction
            </Link>
          </h2>
          <p>Extract product information from Amazon using a direct URL.</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            <Link
              href="/AsyncWebCrawling"
              className="text-blue-500 hover:underline"
            >
              Asynchronous Web Crawling
            </Link>
          </h2>
          <p>Crawl multiple URLs concurrently for enhanced efficiency.</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            <Link
              href="/LLMExtraction"
              className="text-blue-500 hover:underline"
            >
              LLM Extraction
            </Link>
          </h2>
          <p>
            Extract structured data using Large Language Models with different
            input formats.
          </p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            <Link
              href="/ScreenshotAndPDFExport"
              className="text-blue-500 hover:underline"
            >
              Screenshot and PDF Export
            </Link>
          </h2>
          <p>Capture full-page screenshots and export web content to PDF.</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            <Link
              href="/ClickingButtonsToLoadContent"
              className="text-blue-500 hover:underline"
            >
              Clicking Buttons to Load More Content
            </Link>
          </h2>
          <p>
            Demonstrates handling dynamic content loading by clicking buttons.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExamplesPage;
