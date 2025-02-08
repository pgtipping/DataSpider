import { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import DocsSidebar from "@/components/docs/docs-sidebar";
import DocsContent from "@/components/docs/docs-content";
import DocsSearch from "@/components/docs/docs-search";
import { Breadcrumb } from "@/components/ui/breadcrumb";

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

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Documentation", href: "/docs" },
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
      <div className="flex flex-col md:flex-row min-h-screen">
        <DocsSidebar
          sections={sections}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Breadcrumb items={breadcrumbItems} />
              <div className="mt-4">
                <DocsSearch
                  sections={sections}
                  setActiveSection={setActiveSection}
                />
              </div>
            </div>
            <DocsContent sections={sections} activeSection={activeSection} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DocsPage;
