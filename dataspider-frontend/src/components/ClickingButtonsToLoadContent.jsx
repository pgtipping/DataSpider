"use client";

import React, { useState } from "react";

const ClickingButtonsToLoadContent = () => {
  const [url, setUrl] = useState("");
  const [clickingMode, setClickingMode] = useState("step-by-step");
  const [loadedContent, setLoadedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDynamicContent = async () => {
    setLoading(true);
    setError(null);
    setLoadedContent("");

    try {
      const response = await fetch("/api/dynamic-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, clickingMode }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      setLoadedContent(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchDynamicContent();
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">
        Clicking Buttons to Load Content
      </h2>
      <p>Click buttons to load more content (step-by-step/single-call).</p>
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
        <div className="mb-4">
          <label
            htmlFor="clickingMode"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Clicking Mode:
          </label>
          <select
            id="clickingMode"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={clickingMode}
            onChange={(e) => setClickingMode(e.target.value)}
          >
            <option value="step-by-step">Step-by-Step</option>
            <option value="single-call">Single-Call</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white rounded p-2 mt-2"
          disabled={loading}
        >
          {loading ? "Loading..." : "Load Content"}
        </button>
      </form>

      {error && <p className="text-red-500">Error: {error.message}</p>}

      {loadedContent && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Loaded Content:</h3>
          <div
            className="border rounded p-2 overflow-auto"
            dangerouslySetInnerHTML={{ __html: loadedContent }}
            style={{ wordWrap: "break-word" }}
          />
        </div>
      )}
    </div>
  );
};

export default ClickingButtonsToLoadContent;
