"use client";

import React, { useState } from "react";

const LLMExtraction = () => {
  const [inputText, setInputText] = useState("");
  const [inputFormat, setInputFormat] = useState("text");
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExtractedData = async () => {
    setLoading(true);
    setError(null);
    setExtractedData(null);

    try {
      const response = await fetch("/api/llm-extraction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText, format: inputFormat }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setExtractedData(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchExtractedData();
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">LLM Extraction</h2>
      <p>Perform LLM extraction with different input formats.</p>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-2">
          <label
            htmlFor="inputText"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Text / URL:
          </label>
          <input
            type="text"
            id="inputText"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="inputFormat"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Input Format:
          </label>
          <select
            id="inputFormat"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={inputFormat}
            onChange={(e) => setInputFormat(e.target.value)}
          >
            <option value="text">Plain Text</option>
            <option value="html">HTML</option>
            <option value="markdown">Markdown</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white rounded p-2 mt-2"
          disabled={loading}
        >
          {loading ? "Extracting..." : "Extract"}
        </button>
      </form>

      {error && <p className="text-red-500">Error: {error.message}</p>}

      {extractedData && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Extracted Data:</h3>
          <pre>{JSON.stringify(extractedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default LLMExtraction;
