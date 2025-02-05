import AmazonProductExtraction from "../components/AmazonProductExtraction";
import AsyncWebCrawling from "../components/AsyncWebCrawling";
import LLMExtraction from "../components/LLMExtraction";
import ScreenshotAndPDFExport from "../components/ScreenshotAndPDFExport";
import ClickingButtonsToLoadContent from "../components/ClickingButtonsToLoadContent";
const ExamplesPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Examples</h1>
      <p className="text-xl text-center mb-12">
        Explore the capabilities of DataSpider with these examples.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Hello, World!</h2>
          <p>This is a basic example demonstrating a simple crawl.</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Amazon Product Extraction
          </h2>
          <p>Extract product information from Amazon using a direct URL.</p>
          <AmazonProductExtraction />
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Asynchronous Web Crawling
          </h2>
          <p>Crawl multiple URLs concurrently for enhanced efficiency.</p>
          <AsyncWebCrawling />
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">LLM Extraction</h2>
          <p>
            Extract structured data using Large Language Models with different
            input formats.
          </p>
          <LLMExtraction />
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Screenshot and PDF Export
          </h2>
          <p>Capture full-page screenshots and export web content to PDF.</p>
          <ScreenshotAndPDFExport />
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Clicking Buttons to Load More Content
          </h2>
          <p>
            Demonstrates handling dynamic content loading by clicking buttons.
          </p>
          <ClickingButtonsToLoadContent />
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Asynchronous Web Crawling
          </h2>
          <p>Crawl multiple URLs concurrently for enhanced efficiency.</p>
          <AsyncWebCrawling />
        </div>
      </div>
    </div>
  );
};

export default ExamplesPage;
