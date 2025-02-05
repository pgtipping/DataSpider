import { Link } from "react-router-dom"

const Header = () => {
  return (
    <header className="bg-white shadow-md p-4">
      <nav className="flex justify-between items-center max-w-6xl mx-auto">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          DataSpider
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="text-gray-600 hover:text-blue-600">
              Home
            </Link>
          </li>
          <li>
            <Link to="/pricing" className="text-gray-600 hover:text-blue-600">
              Pricing
            </Link>
          </li>
          <li>
            <Link to="/docs" className="text-gray-600 hover:text-blue-600">
              Docs
            </Link>
          </li>
          <li>
            <a href="#contact" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Contact Sales
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header

