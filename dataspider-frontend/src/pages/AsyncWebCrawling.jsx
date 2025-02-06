import React from "react";
import AsyncWebCrawling from "../components/AsyncWebCrawling";

const AsyncWebCrawlingPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">
        Asynchronous Web Crawling
      </h1>
      <p className="text-xl text-center mb-12">
        Crawl multiple URLs concurrently for enhanced efficiency.
      </p>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">
          Asynchronous Web Crawling
        </h2>
        <AsyncWebCrawling />
      </div>
    </div>
  );
};

export default AsyncWebCrawlingPage;
