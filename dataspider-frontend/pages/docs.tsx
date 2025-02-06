import { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import DocsSidebar from "../src/components/DocsSidebar/DocsSidebar";
import DocsContent from "../src/components/DocsContent/DocsContent";
import DocsSearch from "../src/components/DocsSearch/DocsSearch";
import Breadcrumb from "../src/components/Breadcrumb/Breadcrumb";

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    content:
      "Welcome to DataSpider! This guide will help you get started with our web crawling API.",
  },
  {
    id: "authentication",
    title: "Authentication",
    content:
      "To use the DataSpider API, you'll need to authenticate your requests using an API key.",
  },
  {
    id: "basic-usage",
    title: "Basic Usage",
    content:
      "To start a crawl, use the crawl method with the target URL and crawl depth.",
  },
];

const DocsPage: NextPage = () => {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  return (
    <>
      <Head>
        <title>DataSpider Documentation - API Reference and Guides</title>
        <meta
          name="description"
          content="Complete documentation for DataSpider's web crawling API, including getting started guides, authentication, and usage examples."
        />
      </Head>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">Documentation</h1>
        <DocsSearch />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <DocsSidebar
            sections={sections}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
          <DocsContent sections={sections} activeSection={activeSection} />
        </div>
      </div>
    </>
  );
};

export default DocsPage;
