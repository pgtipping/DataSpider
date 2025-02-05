import { useState } from "react"
import styles from "./TryItNow.module.css"

const TryItNow = () => {
  const [url, setUrl] = useState("")
  const [depth, setDepth] = useState(1)
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    // Simulating API call
    setTimeout(() => {
      setResult({
        jobId: Math.random().toString(36).substr(2, 9),
        status: "in_progress",
        estimatedCompletionTime: new Date(Date.now() + 60000).toISOString(),
      })
      setIsLoading(false)
    }, 2000)
  }

  return (
    <section className={styles.tryItNow}>
      <h2 className={styles.sectionTitle}>Try DataSpider Now</h2>
      <form onSubmit={handleSubmit} className={styles.demoForm}>
        <div className={styles.inputGroup}>
          <label htmlFor="url">URL to crawl:</label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="https://example.com"
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="depth">Crawl depth:</label>
          <input
            type="number"
            id="depth"
            value={depth}
            onChange={(e) => setDepth(Number.parseInt(e.target.value))}
            min="1"
            max="5"
            required
            className={styles.input}
          />
        </div>
        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? "Processing..." : "Start Crawl"}
        </button>
      </form>
      {result && (
        <div className={styles.result}>
          <h3>Crawl Job Started</h3>
          <p>Job ID: {result.jobId}</p>
          <p>Status: {result.status}</p>
          <p>Estimated Completion Time: {new Date(result.estimatedCompletionTime).toLocaleString()}</p>
        </div>
      )}
    </section>
  )
}

export default TryItNow

