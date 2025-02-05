import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Header from "./components/Header/Header"
import Footer from "./components/Footer/Footer"
import HomePage from "./pages/Home/Home"
import PricingPage from "./pages/Pricing/Pricing"
import DocsPage from "./pages/Docs/Docs"
import AboutPage from "./pages/About/About"
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner"
import useLoadingStore from "./store/loadingStore"
import styles from "./App.module.css"

function App() {
  const { isLoading } = useLoadingStore()

  return (
    <Router>
      <div className={styles.app}>
        <a href="#main-content" className={styles.skipLink}>
          Skip to main content
        </a>
        <Header />
        <main id="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
        {isLoading && <LoadingSpinner />}
      </div>
    </Router>
  )
}

export default App

