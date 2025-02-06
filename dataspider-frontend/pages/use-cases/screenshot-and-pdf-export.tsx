"use client";

import "../app/globals.css";
import React, { useState } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Download,
  Camera,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";

const ScreenshotAndPDFExport = () => {
  const [url, setUrl] = useState("");
  const [type, setType] = useState("screenshot");
  const [options, setOptions] = useState({
    width: 1920,
    height: 1080,
    scale: 1,
    fullPage: true,
  });
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

    if (!url.trim()) {
      setError("Please enter a valid URL");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/screenshot-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, type, options }),
      });

      if (type === "pdf") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "webpage.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccessMessage("PDF generated and downloaded successfully!");
      } else {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to capture content");
        }
        setResult(data.data);
        setSuccessMessage("Screenshot captured successfully!");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (name, value) => {
    setOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
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
            Screenshot & PDF Export
          </h1>
          <p className="text-xl text-center text-gray-600 mb-12">
            Capture screenshots or generate PDFs from any webpage
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capture Type
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setType("screenshot")}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      type === "screenshot"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Screenshot
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("pdf")}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      type === "pdf"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    PDF
                  </button>
                </div>
              </div>

              {type === "screenshot" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Viewport Size
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        value={options.width}
                        onChange={(e) =>
                          handleOptionChange("width", parseInt(e.target.value))
                        }
                        placeholder="Width"
                        className="px-4 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="number"
                        value={options.height}
                        onChange={(e) =>
                          handleOptionChange("height", parseInt(e.target.value))
                        }
                        placeholder="Height"
                        className="px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scale Factor
                    </label>
                    <input
                      type="number"
                      value={options.scale}
                      onChange={(e) =>
                        handleOptionChange("scale", parseFloat(e.target.value))
                      }
                      step="0.1"
                      min="0.1"
                      max="3"
                      className="px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="fullPage"
                      checked={options.fullPage}
                      onChange={(e) =>
                        handleOptionChange("fullPage", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="fullPage"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Capture Full Page
                    </label>
                  </div>
                </div>
              )}
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
                  {type === "pdf" ? "Generating PDF..." : "Capturing..."}
                </>
              ) : (
                <>
                  {type === "pdf" ? (
                    <>
                      <FileText className="h-5 w-5 mr-2" />
                      Generate PDF
                    </>
                  ) : (
                    <>
                      <Camera className="h-5 w-5 mr-2" />
                      Capture Screenshot
                    </>
                  )}
                </>
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

          {result && result.type === "screenshot" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Screenshot Preview</h2>
                <a
                  href={`data:image/png;base64,${result.image}`}
                  download="screenshot.png"
                  className="flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </div>
              <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={`data:image/png;base64,${result.image}`}
                  alt="Captured screenshot"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenshotAndPDFExport;
