"use client";

import "../app/globals.css";
import React, { useState } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  X,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AsyncWebCrawling = () => {
  const [urls, setUrls] = useState([""]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const addUrlField = () => {
    if (urls.length < 10) {
      setUrls([...urls, ""]);
    }
  };

  const removeUrlField = (index) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
    }
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage("");
    setResults(null);

    const validUrls = urls.filter((url) => url.trim() !== "");

    if (validUrls.length === 0) {
      setError("Please enter at least one valid URL");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/async-crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls: validUrls }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to crawl URLs");
      }

      setResults(data.data);
      setSuccessMessage(`Successfully crawled ${data.data.length} URLs`);
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
            Asynchronous Web Crawling
          </h1>
          <p className="text-xl text-center text-gray-600 mb-12">
            Crawl multiple URLs concurrently and extract their content
          </p>
        </motion.div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {urls.map((url, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                  {urls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUrlField(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                      disabled={loading}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={addUrlField}
                disabled={loading || urls.length >= 10}
                className="flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add URL {urls.length >= 10 && "(max 10)"}
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`flex items-center px-6 py-2 rounded-md text-white ${
                  loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Crawling...
                  </>
                ) : (
                  "Start Crawling"
                )}
              </button>
            </div>
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

          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              <h2 className="text-2xl font-semibold mb-4">Crawling Results</h2>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      result.status === "success"
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium flex items-center">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          {result.url}
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      </h3>
                      <span
                        className={`px-2 py-1 text-sm rounded-full ${
                          result.status === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {result.status}
                      </span>
                    </div>

                    {result.status === "success" ? (
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Title:</span>{" "}
                          {result.title}
                        </p>
                        <p>
                          <span className="font-medium">Description:</span>{" "}
                          {result.description}
                        </p>
                        {result.h1s.length > 0 && (
                          <div>
                            <span className="font-medium">H1 Headers:</span>
                            <ul className="list-disc list-inside ml-4">
                              {result.h1s.map((h1, i) => (
                                <li key={i}>{h1}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">
                            Links Found: {result.links.length}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-red-600">{result.error}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AsyncWebCrawling;
