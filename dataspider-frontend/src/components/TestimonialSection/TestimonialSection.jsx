import styles from "./TestimonialSection.module.css"
import TestimonialCard from "./TestimonialCard"

const testimonials = [
  {
    quote:
      "DataSpider has revolutionized our data collection process. It's fast, reliable, and incredibly easy to use.",
    author: "Jane Doe",
    company: "Tech Innovators Inc.",
  },
  {
    quote: "The scalability of DataSpider is unmatched. We've been able to handle our growing data needs effortlessly.",
    author: "John Smith",
    company: "Data Analytics Co.",
  },
]

const TestimonialSection = () => {
  return (
    <section className={styles.testimonialSection}>
      <h2 className={styles.sectionTitle}>What Our Clients Say</h2>
      <div className={styles.testimonialGrid}>
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} />
        ))}
      </div>
    </section>
  )
}

export default TestimonialSection

