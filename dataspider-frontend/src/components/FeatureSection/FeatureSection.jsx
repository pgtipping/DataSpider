import styles from "./FeatureSection.module.css"
import FeatureCard from "./FeatureCard"

const features = [
  {
    title: "Advanced Crawling",
    description: "Our sophisticated algorithms ensure thorough and efficient web crawling.",
    icon: "🕷️",
  },
  {
    title: "Data Extraction",
    description: "Extract structured data from any website with ease and accuracy.",
    icon: "📊",
  },
  {
    title: "Scalable Infrastructure",
    description: "Handle millions of requests with our robust and scalable architecture.",
    icon: "🏗️",
  },
  {
    title: "Real-time Monitoring",
    description: "Monitor your crawling jobs in real-time with detailed analytics.",
    icon: "📈",
  },
]

const FeatureSection = () => {
  return (
    <section className={styles.featureSection}>
      <h2 className={styles.sectionTitle}>Why Choose DataSpider?</h2>
      <div className={styles.featureGrid}>
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  )
}

export default FeatureSection

