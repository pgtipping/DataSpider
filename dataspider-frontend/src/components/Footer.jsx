const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold">DataSpider</h3>
            <p className="mt-2">Advanced web crawling solutions</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
            <ul>
              <li>
                <a href="/" className="hover:text-blue-400">
                  Home
                </a>
              </li>
              <li>
                <a href="/pricing" className="hover:text-blue-400">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/docs" className="hover:text-blue-400">
                  Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p>&copy; 2023 DataSpider. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

