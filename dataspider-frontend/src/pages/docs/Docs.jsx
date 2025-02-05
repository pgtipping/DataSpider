import { useState } from "react"
import styles from "./Docs.module.css"
import DocsSidebar from "../../components/DocsSidebar/DocsSidebar"
import DocsContent from "../../components/DocsContent/DocsContent"
import DocsSearch from "../../components/DocsSearch/DocsSearch"

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: "Welcome to DataSpider! This guide will help you get started with our web crawling API.",
  },
  {
    id: "authentication",
    title: "Authentication",
    content: "To use the DataSpider API, you'll need to authenticate your requests using an API key.",
  },
  {
    id: "basic-usage",
    title: "Basic Usage",
    content: "To start a crawl, use the crawl method with the target URL and crawl depth.",
  },
  {
    id: "advanced-features",
    title: "Advanced Features",
    content: "Learn about custom extraction rules and other advanced features of DataSpider.",
  },
  {
    id: "api-reference",
    title: "API Reference",
    content: "Detailed information about all DataSpider API endpoints and parameters.",
  },
]

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState(sections[0].id)

  return (
    <div className={styles.docsPage}>
      <h1 className={styles.pageTitle}>DataSpider Documentation</h1>
      <div className={styles.docsContainer}>
        <aside className={styles.sidebar}>
          <DocsSearch sections={sections} setActiveSection={setActiveSection} />
          <DocsSidebar sections={sections} activeSection={activeSection} setActiveSection={setActiveSection} />
        </aside>
        <DocsContent activeSection={activeSection} sections={sections} />
      </div>
    </div>
  )
}

export default DocsPage

