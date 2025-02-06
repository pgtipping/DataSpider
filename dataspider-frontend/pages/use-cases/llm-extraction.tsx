"use client";

import "../app/globals.css";
import React, { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

const LLMExtraction = () => {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("text");
  const [extractedContent, setExtractedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage("");
    setExtractedContent(null);
    setCopied(false);

    if (!url.trim()) {
      setError("Please enter a valid URL");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/llm-extraction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, format }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract content");
      }

      setExtractedContent(data.data);
      setSuccessMessage("Content extracted successfully!");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (extractedContent) {
      try {
        await navigator.clipboard.writeText(
          format === "json"
            ? JSON.stringify(extractedContent, null, 2)
            : extractedContent.content
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        setError("Failed to copy to clipboard");
      }
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
            LLM Content Extraction
          </h1>
          <p className="text-xl text-center text-gray-600 mb-12">
            Extract and format content from any webpage using AI
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
                htmlFor="format"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Output Format
              </label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="text">Plain Text</option>
                <option value="markdown">Markdown</option>
                <option value="json">JSON</option>
              </select>
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
                  Extracting...
                </>
              ) : (
                "Extract Content"
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

          {extractedContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Extracted Content</h2>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 overflow-auto max-h-[600px]">
                {format === "json" ? (
                  <pre className="text-sm">
                    {JSON.stringify(extractedContent, null, 2)}
                  </pre>
                ) : (
                  <div className="prose max-w-none">
                    {format === "markdown" ? (
                      <pre className="whitespace-pre-wrap">
                        {extractedContent.content}
                      </pre>
                    ) : (
                      <p className="whitespace-pre-wrap">
                        {extractedContent.content}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {format === "json" && extractedContent.metadata && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      Word Count: {extractedContent.metadata.wordCount}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      Character Count: {extractedContent.metadata.charCount}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LLMExtraction;
