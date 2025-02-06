import { FC } from "react";
import styles from "./FAQSection.module.css";
import FAQItem from "./FAQItem";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
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
    question: "What kind of support do you offer?",
    answer:
      "We provide comprehensive support including email support for all plans, priority support for Professional plans, and 24/7 phone and email support for Enterprise customers.",
  },
  {
    question: "Can I customize the data extraction rules?",
    answer:
      "Yes, Professional and Enterprise plans allow you to define custom extraction rules to target specific data on web pages. Our API provides flexible options for data selection and formatting.",
  },
  {
    question: "How do you handle rate limiting and large-scale crawling?",
    answer:
      "DataSpider implements intelligent rate limiting and distributed crawling to ensure optimal performance while respecting website resources. Enterprise plans include customizable crawling strategies.",
  },
];

const FAQSection: FC = () => {
  return (
    <section className={styles.faqSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Frequently Asked Questions</h2>
        <div className={styles.faqGrid}>
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
