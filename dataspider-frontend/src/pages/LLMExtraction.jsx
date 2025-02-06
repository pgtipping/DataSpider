import React from "react";
import LLMExtraction from "../components/LLMExtraction";

const LLMExtractionPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">LLM Extraction</h1>
      <p className="text-xl text-center mb-12">
        Extract structured data using Large Language Models with different input
        formats.
      </p>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">LLM Extraction</h2>
        <LLMExtraction />
      </div>
    </div>
  );
};

export default LLMExtractionPage;
