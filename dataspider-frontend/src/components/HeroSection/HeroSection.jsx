import styles from "./HeroSection.module.css"

const HeroSection = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>Powerful Web Crawling for Your Business</h1>
        <p className={styles.heroSubtitle}>
          DataSpider provides advanced web crawling solutions to help you extract valuable data efficiently and
          reliably.
        </p>
        <div className={styles.ctaContainer}>
          <a href="#getStarted" className={styles.primaryCta}>
            Get Started
          </a>
          <a href="#learnMore" className={styles.secondaryCta}>
            Learn More
          </a>
        </div>
      </div>
      <div className={styles.heroImage}>
        {/* Add an appropriate hero image here */}
        <img src="/placeholder.svg" alt="DataSpider Web Crawling" />
      </div>
    </section>
  )
}

export default HeroSection

