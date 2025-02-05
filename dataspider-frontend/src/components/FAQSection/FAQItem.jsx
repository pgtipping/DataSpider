import { useState } from "react"
import styles from "./FAQItem.module.css"

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={styles.faqItem}>
      <h3>
        <button
          className={styles.questionButton}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${question.replace(/\s+/g, "-").toLowerCase()}`}
        >
          {question}
          <span className={`${styles.arrow} ${isOpen ? styles.open : ""}`} aria-hidden="true">
            ▼
          </span>
        </button>
      </h3>
      <div id={`faq-answer-${question.replace(/\s+/g, "-").toLowerCase()}`} className={styles.answer} hidden={!isOpen}>
        <p>{answer}</p>
      </div>
    </div>
  )
}

export default FAQItem

