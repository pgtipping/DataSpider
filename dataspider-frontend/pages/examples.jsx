"use client";

import "../app/globals.css";
import React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const useCases = [
  {
    title: "Basic Web Crawling",
    description:
      "Learn how to crawl web pages and extract basic information like text, links, and images.",
    path: "/use-cases/basic-web-crawling",
    category: "Getting Started",
  },
  {
    title: "Asynchronous Web Crawling",
    description:
      "Explore advanced crawling techniques with concurrent requests and better performance.",
    path: "/use-cases/async-web-crawling",
    category: "Advanced Features",
  },
  {
    title: "Dynamic Content Extraction",
    description:
      "Handle websites that load content dynamically through button clicks and user interactions.",
    path: "/use-cases/clicking-buttons-to-load-content",
    category: "Advanced Features",
  },
  {
    title: "Screenshot & PDF Export",
    description:
      "Capture screenshots and generate PDF exports of crawled web pages.",
    path: "/use-cases/screenshot-and-pdf-export",
    category: "Export & Media",
  },
  {
    title: "LLM-Powered Extraction",
    description:
      "Use AI to intelligently extract and structure data from web pages.",
    path: "/use-cases/llm-extraction",
    category: "AI Integration",
  },
  {
    title: "Amazon Product Extraction",
    description:
      "Specialized crawler for extracting product information from Amazon.",
    path: "/use-cases/amazon-product-extraction",
    category: "Specialized Solutions",
  },
];

const Examples = () => {
  const categories = [...new Set(useCases.map((uc) => uc.category))];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-8 text-center">
          DataSpider Use Cases
        </h1>
        <p className="text-xl text-gray-600 mb-12 text-center">
          Explore our comprehensive collection of web crawling examples and
          capabilities
        </p>

        {categories.map((category) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases
                .filter((uc) => uc.category === category)
                .map((useCase) => (
                  <motion.div
                    key={useCase.path}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>{useCase.title}</CardTitle>
                        <CardDescription>{useCase.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link href={useCase.path}>
                          <Button className="w-full">Try it out</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Examples;
