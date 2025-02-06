"use client";

import "../app/globals.css";
import React, { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, Code } from "lucide-react";
import { motion } from "framer-motion";

const ClickingButtonsToLoadContent = () => {
  const [url, setUrl] = useState("");
  const [selector, setSelector] = useState("");
  const [maxClicks, setMaxClicks] = useState(5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage("");
    setResult(null);

    if (!url.trim() || !selector.trim()) {
      setError("Please enter both URL and selector");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/dynamic-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, selector, maxClicks }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load dynamic content");
      }

      setResult(data.data);
      setSuccessMessage(
        `Successfully loaded ${data.data.totalItems} items after ${data.data.clickCount} clicks!`
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-center mb-4">
            Dynamic Content Loading
          </h1>
          <p className="text-xl text-center text-gray-600 mb-12">
            Load content by automatically clicking buttons or "load more"
            elements
          </p>
        </motion.div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Webpage URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="selector"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                CSS Selector
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Code className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="selector"
                  value={selector}
                  onChange={(e) => setSelector(e.target.value)}
                  placeholder=".load-more-button, #loadMore"
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Enter the CSS selector for the "load more" button or element
              </p>
            </div>

            <div>
              <label
                htmlFor="maxClicks"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Maximum Clicks
              </label>
              <input
                type="number"
                id="maxClicks"
                value={maxClicks}
                onChange={(e) => setMaxClicks(parseInt(e.target.value))}
                min="1"
                max="20"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Maximum number of times to click the element (1-20)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Loading Content...
                </>
              ) : (
                "Start Loading"
              )}
            </button>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-red-50 rounded-md flex items-start"
            >
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-green-50 rounded-md flex items-start"
            >
              <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
              <p className="ml-3 text-sm text-green-700">{successMessage}</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              <h2 className="text-2xl font-semibold mb-4">Loaded Content</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      Total Clicks: {result.clickCount}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      Items Found: {result.totalItems}
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg divide-y">
                  {result.items.map((item, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Item {index + 1}
                        </span>
                        <span className="text-xs text-gray-400">
                          Classes: {item.classes.join(", ")}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-700">{item.text}</p>
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer">
                          View HTML
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                          {item.html}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClickingButtonsToLoadContent;
