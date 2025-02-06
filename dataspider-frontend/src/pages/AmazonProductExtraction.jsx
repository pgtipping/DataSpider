import React from "react";
import AmazonProductExtraction from "../components/AmazonProductExtraction";

const AmazonProductExtractionPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">
        Amazon Product Extraction
      </h1>
      <p className="text-xl text-center mb-12">
        Extract product information from Amazon using a direct URL.
      </p>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">
          Amazon Product Extraction
        </h2>
        <AmazonProductExtraction />
      </div>
    </div>
  );
};

export default AmazonProductExtractionPage;
