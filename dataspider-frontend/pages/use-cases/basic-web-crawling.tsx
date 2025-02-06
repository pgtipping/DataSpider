"use client";

import "../app/globals.css";
import React, { useState, FormEvent } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Breadcrumb from "../../src/components/Breadcrumb/Breadcrumb";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Globe,
  Link2,
  Image as ImageIcon,
  FileText,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";

interface Link {
  href: string;
  text: string;
}

interface Heading {
  level: number;
  text: string;
}

interface CrawlResult {
  links: Link[];
  images: string[];
  text: string[];
  headings: Heading[];
  title: string;
  description: string;
  status: string;
}

const BasicWebCrawling: NextPage = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const breadcrumbItems = [
    { label: "Examples", href: "/examples" },
    { label: "Basic Web Crawling", href: "/use-cases/basic-web-crawling" },
  ];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setSuccessMessage("");

    if (!url.trim()) {
      setError("Please enter a valid URL");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/basic-crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to crawl the website");
      }

      const data = await response.json();
      setResult(data);
      setSuccessMessage("Successfully crawled the website!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Basic Web Crawling - DataSpider Examples</title>
        <meta
          name="description"
          content="Try out DataSpider's basic web crawling capabilities. Extract links, images, and text from any webpage."
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Breadcrumb items={breadcrumbItems} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <div className="inline-block p-2 bg-blue-50 rounded-2xl mb-6">
              <Globe className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Basic Web Crawling
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Extract basic information from any webpage with our intelligent
              crawler
            </p>
          </motion.div>

          <div className="mt-12 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label
                  htmlFor="url"
                  className="block text-lg font-semibold text-gray-800 mb-3"
                >
                  Webpage URL
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="input-field pl-11"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Crawling...
                  </>
                ) : (
                  "Start Crawling"
                )}
              </button>
            </form>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100 flex items-start"
              >
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100 flex items-start"
              >
                <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
                <p className="ml-3 text-sm text-green-700">{successMessage}</p>
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 space-y-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Globe className="h-8 w-8 text-blue-600" />
                  Crawling Results
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Title & Description
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Title
                        </h4>
                        <p className="mt-1 text-lg text-gray-900">
                          {result.title}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Description
                        </h4>
                        <p className="mt-1 text-gray-700">
                          {result.description || "No description available"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      Headings
                    </h3>
                    <div className="space-y-4">
                      {result.headings.map((heading, index) => (
                        <div key={index} className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-500">
                            {heading.text}
                          </h4>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-blue-600" />
                    Links ({result.links.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.links.slice(0, 10).map((link, index) => (
                      <a
                        key={index}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors duration-200 group"
                      >
                        <span className="text-gray-700 group-hover:text-blue-700 flex-1 truncate">
                          {link.text}
                        </span>
                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500 ml-2 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                  {result.links.length > 10 && (
                    <p className="mt-4 text-sm text-gray-500 text-center">
                      ...and {result.links.length - 10} more links
                    </p>
                  )}
                </div>

                {result.images.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-purple-600" />
                      Images ({result.images.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {result.images.slice(0, 8).map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden group hover:ring-2 hover:ring-purple-500 transition-all duration-200"
                        >
                          <img
                            src={image}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      ))}
                    </div>
                    {result.images.length > 8 && (
                      <p className="mt-4 text-sm text-gray-500 text-center">
                        ...and {result.images.length - 8} more images
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Page Content Preview
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {result.text}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BasicWebCrawling;
