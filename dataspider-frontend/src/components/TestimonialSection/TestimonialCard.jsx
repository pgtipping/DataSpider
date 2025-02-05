import styles from "./TestimonialCard.module.css"

const TestimonialCard = ({ quote, author, company }) => {
  return (
    <div className={styles.testimonialCard}>
      <blockquote className={styles.quote}>{quote}</blockquote>
      <div className={styles.author}>{author}</div>
      <div className={styles.company}>{company}</div>
    </div>
  )
}

export default TestimonialCard

