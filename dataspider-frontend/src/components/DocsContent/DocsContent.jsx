import styles from "./DocsContent.module.css"

const DocsContent = ({ activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case "getting-started":
        return (
          <>
            <h2>Getting Started</h2>
            <p>Welcome to DataSpider! This guide will help you get started with our web crawling API.</p>
            <h3>Installation</h3>
            <p>To use DataSpider in your project, you can install our official SDK:</p>
            <pre className={styles.codeBlock}>
              <code>npm install dataspider-sdk</code>
            </pre>
          </>
        )
      case "authentication":
        return (
          <>
            <h2>Authentication</h2>
            <p>
              To use the DataSpider API, you'll need to authenticate your requests using an API key. You can obtain your
              API key from your account dashboard.
            </p>
            <h3>Example</h3>
            <pre className={styles.codeBlock}>
              <code>{`
import { DataSpider } from 'dataspider-sdk';

const dataspider = new DataSpider('YOUR_API_KEY');
              `}</code>
            </pre>
          </>
        )
      case "basic-usage":
        return (
          <>
            <h2>Basic Usage</h2>
            <p>To start a crawl, use the crawl method with the target URL and crawl depth:</p>
            <pre className={styles.codeBlock}>
              <code>{`
const job = await dataspider.crawl({
  url: 'https://example.com',
  depth: 2
});

console.log(job.id); // The job ID for tracking progress
              `}</code>
            </pre>
          </>
        )
      case "advanced-features":
        return (
          <>
            <h2>Advanced Features</h2>
            <h3>Custom Extraction Rules</h3>
            <p>You can define custom extraction rules to target specific data on web pages:</p>
            <pre className={styles.codeBlock}>
              <code>{`
const job = await dataspider.crawl({
  url: 'https://example.com',
  depth: 2,
  extractionRules: {
    title: { selector: 'h1', type: 'text' },
    price: { selector: '.price', type: 'number' },
    images: { selector: 'img', type: 'attribute', attribute: 'src' }
  }
});
              `}</code>
            </pre>
          </>
        )
      case "api-reference":
        return (
          <>
            <h2>API Reference</h2>
            <h3>DataSpider.crawl(options)</h3>
            <p>Starts a new crawling job.</p>
            <h4>Parameters</h4>
            <ul>
              <li>
                <code>options.url</code> (string): The starting URL for the crawl.
              </li>
              <li>
                <code>options.depth</code> (number): The maximum depth of the crawl.
              </li>
              <li>
                <code>options.extractionRules</code> (object, optional): Custom data extraction rules.
              </li>
            </ul>
            <h4>Returns</h4>
            <p>A Promise that resolves to a Job object.</p>
          </>
        )
      default:
        return <p>Select a section from the sidebar to view its content.</p>
    }
  }

  return <div className={styles.content}>{renderContent()}</div>
}

export default DocsContent

