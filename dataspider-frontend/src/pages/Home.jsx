const HomePage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Welcome to DataSpider</h1>
      <p className="text-xl text-center mb-12">Advanced web crawling solutions for your business needs</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Powerful Crawling</h2>
          <p>Efficiently crawl websites with our advanced algorithms</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Data Extraction</h2>
          <p>Extract structured data from any website with ease</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Scalable Infrastructure</h2>
          <p>Handle millions of requests with our robust architecture</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage

