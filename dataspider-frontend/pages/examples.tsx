import React, { Suspense } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import ErrorBoundary from "@/components/ui/error-boundary";
import UseCaseCard, { UseCaseCardProps } from "@/components/use-case-card";

interface UseCase extends Omit<UseCaseCardProps, "className"> {
  category: string;
}

const useCases: UseCase[] = [
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

const LoadingCard = () => (
  <div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
);

const Examples: React.FC = () => {
  const categories = [...new Set(useCases.map((uc) => uc.category))];
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Examples", href: "/examples" },
  ];

  return (
    <>
      <Head>
        <title>DataSpider Use Cases - Web Crawling Examples</title>
        <meta
          name="description"
          content="Explore DataSpider's comprehensive collection of web crawling examples and capabilities. Learn about basic crawling, async operations, dynamic content extraction, and more."
        />
        <meta
          name="keywords"
          content="web crawling, data extraction, scraping examples, DataSpider, async crawling, LLM extraction"
        />
      </Head>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb items={breadcrumbItems} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4 text-center">
              DataSpider Use Cases
            </h1>
            <p className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
              Explore our comprehensive collection of web crawling examples and
              capabilities
            </p>

            <ErrorBoundary>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Suspense
                  fallback={
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <LoadingCard key={i} />
                      ))}
                    </div>
                  }
                >
                  {useCases.map((useCase) => (
                    <UseCaseCard
                      key={useCase.path}
                      title={useCase.title}
                      description={useCase.description}
                      path={useCase.path}
                      className="transition-all duration-200 hover:shadow-lg"
                    />
                  ))}
                </Suspense>
              </div>
            </ErrorBoundary>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Examples;
