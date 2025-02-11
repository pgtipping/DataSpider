"use client";

import React, { useState, FormEvent } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Clock,
  User,
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

interface Image {
  src: string;
  alt: string;
  dimensions?: { width: number; height: number };
  highRes?: string;
  originalQuality?: boolean;
  loading?: "lazy" | "eager";
}

interface ContentPost {
  title?: string;
  author?: string;
  timestamp?: string;
  content: string;
  url?: string;
  score?: number;
  comments?: number;
  type: "article" | "social" | "comment" | "general";
}

interface CrawlResult {
  title: string;
  description: string;
  headings: Array<{ level: number; text: string }>;
  links: Array<{ href: string; text: string }>;
  images: Array<Image>;
  content: {
    mainText: string[];
    lists: Array<{ type: "ul" | "ol"; items: string[] }>;
    tables: Array<{ headers: string[]; rows: string[][] }>;
    quotes: string[];
    posts: ContentPost[];
    metadata: {
      wordCount: number;
      readingTime: number;
      lastModified?: string;
      author?: string;
      language?: string;
      keywords?: string[];
      platform?: string;
    };
    sections: Array<{ level: number; title?: string; content: string }>;
  };
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to crawl the website");
      }

      if (!data.data) {
        throw new Error("No data returned from the crawler");
      }

      setResult(data.data);
      setSuccessMessage("Successfully crawled the website!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      console.error("Crawling error:", err);
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
                          {result?.title}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Description
                        </h4>
                        <p className="mt-1 text-gray-700">
                          {result?.description || "No description available"}
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
                      {result?.headings?.map((heading, index) => (
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
                    Links ({result?.links?.length || 0})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result?.links?.slice(0, 10).map((link, index) => (
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
                  {(result?.links?.length || 0) > 10 && (
                    <p className="mt-4 text-sm text-gray-500 text-center">
                      ...and {(result?.links?.length || 0) - 10} more links
                    </p>
                  )}
                </div>

                {(result?.images?.length || 0) > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-purple-600" />
                      Images ({result?.images?.length || 0})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {result?.images?.slice(0, 8).map((image, index) => (
                        <a
                          key={index}
                          href={image.highRes || image.src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative aspect-square rounded-lg overflow-hidden group hover:ring-2 hover:ring-purple-500 transition-all duration-200"
                        >
                          <img
                            src={image.highRes || image.src}
                            alt={image.alt}
                            loading={image.loading || "lazy"}
                            className="absolute inset-0 h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-200"
                          />
                          {image.originalQuality && (
                            <span className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                              HD
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                    {(result?.images?.length || 0) > 8 && (
                      <p className="mt-4 text-sm text-gray-500 text-center">
                        ...and {(result?.images?.length || 0) - 8} more images
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Page Content Preview
                  </h3>

                  {/* Platform and Metadata Header */}
                  <div className="mb-6 pb-4 border-b border-gray-200">
                    <div className="flex flex-wrap items-center gap-3">
                      {result?.content?.metadata?.platform && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {result.content.metadata.platform}
                        </span>
                      )}
                      {result?.content?.metadata?.author && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          By {result.content.metadata.author}
                        </span>
                      )}
                      {result?.content?.metadata?.lastModified && (
                        <span className="text-sm text-gray-500">
                          Updated{" "}
                          {new Date(
                            result.content.metadata.lastModified
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Social Media Posts with Enhanced Display */}
                    {result?.content?.posts?.map((post, index) => (
                      <div
                        key={index}
                        className={`border ${
                          post.type === "social"
                            ? "border-blue-200 bg-blue-50"
                            : post.type === "comment"
                            ? "border-gray-200 bg-gray-50"
                            : "border-purple-200 bg-purple-50"
                        } rounded-lg p-4 hover:border-opacity-75 transition-colors duration-200`}
                      >
                        {post.type === "social" && (
                          <>
                            {post.title && (
                              <h4 className="text-lg font-medium text-gray-900 mb-2">
                                {post.title}
                              </h4>
                            )}
                            <div className="flex items-center text-sm text-gray-500 mb-3 gap-2 flex-wrap">
                              {post.author && (
                                <span className="font-medium text-gray-700 flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                  </svg>
                                  {post.author}
                                </span>
                              )}
                              {post.timestamp && (
                                <span className="flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm1-6.5V5a1 1 0 10-2 0v4a1 1 0 00.4.8l3 2a1 1 0 101.2-1.6L11 9.5z" />
                                  </svg>
                                  {post.timestamp}
                                </span>
                              )}
                              {post.score !== undefined && (
                                <span className="flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                  </svg>
                                  {post.score} points
                                </span>
                              )}
                            </div>
                            <div className="prose prose-gray max-w-none">
                              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {post.content}
                              </p>
                            </div>
                            {post.url && (
                              <a
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View Original
                              </a>
                            )}
                          </>
                        )}

                        {post.type === "article" && (
                          <>
                            <h4 className="text-xl font-semibold text-gray-900 mb-3">
                              {post.title}
                            </h4>
                            <div className="prose prose-purple max-w-none">
                              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {post.content}
                              </p>
                            </div>
                          </>
                        )}

                        {post.type === "comment" && (
                          <div className="pl-4 border-l-4 border-gray-300">
                            <div className="flex items-center text-sm text-gray-500 mb-2 gap-2">
                              {post.author && (
                                <span className="font-medium text-gray-700 flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                  </svg>
                                  {post.author}
                                </span>
                              )}
                              {post.timestamp && (
                                <span className="flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm1-6.5V5a1 1 0 10-2 0v4a1 1 0 00.4.8l3 2a1 1 0 101.2-1.6L11 9.5z" />
                                  </svg>
                                  {post.timestamp}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {post.content}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Lists with Enhanced Styling */}
                    {result?.content?.lists?.map((list, index) => (
                      <div key={index} className="pl-4 py-2">
                        {list.type === "ul" ? (
                          <ul className="list-disc space-y-2 marker:text-blue-500">
                            {list.items.map((item, i) => (
                              <li key={i} className="text-gray-700 pl-2">
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <ol className="list-decimal space-y-2 marker:text-purple-500">
                            {list.items.map((item, i) => (
                              <li key={i} className="text-gray-700 pl-2">
                                {item}
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    ))}

                    {/* Quotes with Enhanced Styling */}
                    {result?.content?.quotes?.map((quote, index) => (
                      <blockquote
                        key={index}
                        className="border-l-4 border-blue-300 bg-blue-50 pl-4 py-3 italic text-gray-700 rounded-r-lg relative"
                      >
                        <svg
                          className="absolute text-blue-300 h-8 w-8 -top-4 -left-4 transform -translate-x-1/2 -translate-y-1/2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                        {quote}
                      </blockquote>
                    ))}

                    {/* Tables with Enhanced Styling */}
                    {result?.content?.tables?.map((table, index) => (
                      <div
                        key={index}
                        className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm"
                      >
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {table.headers.map((header, i) => (
                                <th
                                  key={i}
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {table.rows.map((row, rowIndex) => (
                              <tr
                                key={rowIndex}
                                className={`
                                  hover:bg-gray-50 transition-colors duration-150
                                  ${
                                    rowIndex % 2 === 0
                                      ? "bg-white"
                                      : "bg-gray-50"
                                  }
                                `}
                              >
                                {row.map((cell, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className="px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap"
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}

                    {/* Enhanced Metadata Footer */}
                    {result?.content?.metadata && (
                      <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-xl">
                        <h4 className="text-sm font-medium text-gray-500 mb-4">
                          Page Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-gray-400" />
                              {result.content.metadata.wordCount.toLocaleString()}{" "}
                              words
                            </p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              {result.content.metadata.readingTime} min read
                            </p>
                          </div>
                          <div className="space-y-2">
                            {result.content.metadata.language && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <Globe className="h-4 w-4 mr-2 text-gray-400" />
                                {result.content.metadata.language.toUpperCase()}
                              </p>
                            )}
                            {result.content.metadata.author && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                {result.content.metadata.author}
                              </p>
                            )}
                          </div>
                          <div>
                            {result.content.metadata.keywords &&
                              result.content.metadata.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {result.content.metadata.keywords.map(
                                    (keyword, i) => (
                                      <span
                                        key={i}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                      >
                                        {keyword}
                                      </span>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
