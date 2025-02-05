import { useState } from "react"
import styles from "./DocsSearch.module.css"

const DocsSearch = ({ sections, setActiveSection }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    if (term.length > 2) {
      const results = sections.filter(
        (section) => section.title.toLowerCase().includes(term) || section.content.toLowerCase().includes(term),
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const handleResultClick = (sectionId) => {
    setActiveSection(sectionId)
    setSearchTerm("")
    setSearchResults([])
  }

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Search documentation..."
        value={searchTerm}
        onChange={handleSearch}
        className={styles.searchInput}
        aria-label="Search documentation"
      />
      {searchResults.length > 0 && (
        <ul className={styles.searchResults} role="listbox">
          {searchResults.map((result) => (
            <li key={result.id} role="option">
              <button onClick={() => handleResultClick(result.id)} className={styles.searchResultItem}>
                {result.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DocsSearch

