import styles from "./FAQSection.module.css"
import FAQItem from "./FAQItem"

const faqs = [
  {
    question: "What is DataSpider?",
    answer:
      "DataSpider is an advanced web crawling and data extraction service that helps businesses collect structured data from websites efficiently and reliably.",
  },
  {
    question: "How does DataSpider handle website changes?",
    answer:
      "DataSpider uses intelligent algorithms to adapt to website changes automatically. In cases where significant changes occur, our system notifies you, and our support team is ready to assist with any necessary adjustments.",
  },
  {
    question: "Is DataSpider compliant with website terms of service?",
    answer:
      "DataSpider is designed to respect website terms of service and robots.txt files. We encourage our users to ensure they have the right to crawl and extract data from their target websites.",
  },
  {
    question: "Can I integrate DataSpider with my existing tools?",
    answer:
      "Yes, DataSpider offers a robust API that allows for seamless integration with various tools and platforms. We also provide custom integration services for enterprise clients.",
  },
  {
    question: "How does DataSpider ensure data quality?",
    answer:
      "DataSpider employs multiple data validation and cleaning processes to ensure high-quality output. We also offer custom data processing options for specific requirements.",
  },
]

const FAQSection = () => {
  return (
    <section className={styles.faqSection}>
      <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
      <div className={styles.faqList}>
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </section>
  )
}

export default FAQSection

