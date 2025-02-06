import { FC } from "react";
import Link from "next/link";
import styles from "./HeroSection.module.css";
import { motion } from "framer-motion";

const HeroSection: FC = () => {
  return (
    <section className={styles.hero}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={styles.content}
      >
        <h1 className={styles.title}>
          Advanced Web Crawling{" "}
          <span className={styles.highlight}>Made Simple</span>
        </h1>
        <p className={styles.subtitle}>
          Extract, analyze, and structure web data with powerful AI-driven tools
        </p>
        <div className={styles.cta}>
          <Link href="/examples" className={styles.primaryButton}>
            Try it Now
          </Link>
          <Link href="/docs" className={styles.secondaryButton}>
            View Documentation
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
