const DocsPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Documentation</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Table of Contents</h2>
          <ul>
            <li>
              <a href="#getting-started" className="text-blue-600 hover:underline">
                Getting Started
              </a>
            </li>
            <li>
              <a href="#authentication" className="text-blue-600 hover:underline">
                Authentication
              </a>
            </li>
            <li>
              <a href="#basic-usage" className="text-blue-600 hover:underline">
                Basic Usage
              </a>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <section id="getting-started">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <p className="mb-4">
              Welcome to DataSpider! This guide will help you get started with our web crawling API.
            </p>
          </section>
          <section id="authentication">
            <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
            <p className="mb-4">
              To use the DataSpider API, you'll need to authenticate your requests using an API key.
            </p>
          </section>
          <section id="basic-usage">
            <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
            <p className="mb-4">To start a crawl, use the crawl method with the target URL and crawl depth.</p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default DocsPage

