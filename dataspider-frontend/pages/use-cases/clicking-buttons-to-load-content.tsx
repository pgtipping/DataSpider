"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { Loader2, AlertCircle, CheckCircle2, Code } from "lucide-react";
import { motion } from "framer-motion";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface LoadedItem {
  title?: string;
  description?: string;
  link?: string;
  date?: string;
  author?: string;
}

interface LoadedContent {
  clickCount: number;
  totalItems: number;
  items: { structured: LoadedItem }[];
}

interface Example {
  name: string;
  url: string;
  selector: string;
  description: string;
  contentSelector?: string;
}

const examples: Example[] = [
  {
    name: "Amazon Search Results",
    url: "https://www.amazon.com/s?k=laptop",
    selector: "a.s-pagination-next",
    description:
      "Navigate through Amazon search result pages to extract product information",
    contentSelector: "div[data-component-type='s-search-result']",
  },
  {
    name: "Reddit Programming",
    url: "https://old.reddit.com/r/programming/",
    selector: "a.next-button",
    description: "Load more programming posts from Reddit",
    contentSelector: "div.thing",
  },
  {
    name: "Dev.to Feed",
    url: "https://dev.to/",
    selector: "div.crayons-story__load-more button",
    description: "Load more articles from the Dev.to community feed",
    contentSelector: "article.crayons-story",
  },
  {
    name: "Medium Latest Stories",
    url: "https://medium.com/latest",
    selector: "div[data-testid='postsList'] button",
    description: "Load more stories from Medium's latest feed",
    contentSelector: "article.meteredContent",
  },
];

const ClickingButtonsToLoadContent = () => {
  const [url, setUrl] = useState("");
  const [selector, setSelector] = useState("");
  const [maxClicks, setMaxClicks] = useState(5);
  const [result, setResult] = useState<LoadedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Examples", href: "/examples" },
    {
      label: "Dynamic Content Extraction",
      href: "/use-cases/clicking-buttons-to-load-content",
      active: true,
    },
  ];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (example: Example) => {
    setUrl(example.url);
    setSelector(example.selector);
    setMaxClicks(5); // Reset to default
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Breadcrumb items={breadcrumbItems} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-center mb-4">
            Dynamic Content Loading
          </h1>
          <p className="text-xl text-center text-gray-600 mb-6">
            Load content by automatically clicking buttons or "load more"
            elements
          </p>
          <div className="max-w-3xl mx-auto mb-12">
            <h2 className="text-lg font-semibold mb-4">Try These Examples:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examples.map((example) => (
                <button
                  key={example.name}
                  onClick={() => loadExample(example)}
                  className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left"
                >
                  <h3 className="font-medium text-blue-600">{example.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {example.description}
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    <div>URL: {example.url}</div>
                    <div>Selector: {example.selector}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setUrl(e.target.value)
                }
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
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSelector(e.target.value)
                  }
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setMaxClicks(parseInt(e.target.value))
                }
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
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    Pages Loaded: {result.clickCount + 1}
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
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="space-y-2">
                      {item.structured.title && (
                        <h3 className="font-medium text-lg">
                          {item.structured.title}
                        </h3>
                      )}
                      {item.structured.description && (
                        <p className="text-gray-600">
                          {item.structured.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {item.structured.author && (
                          <span className="flex items-center">
                            <span className="font-medium">By:</span>
                            <span className="ml-1">
                              {item.structured.author}
                            </span>
                          </span>
                        )}
                        {item.structured.date && (
                          <span className="flex items-center">
                            <span className="font-medium">Date:</span>
                            <span className="ml-1">{item.structured.date}</span>
                          </span>
                        )}
                        {item.structured.link && (
                          <a
                            href={item.structured.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Source →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClickingButtonsToLoadContent;
