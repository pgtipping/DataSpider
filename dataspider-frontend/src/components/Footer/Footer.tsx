import { FC } from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>DataSpider</h3>
          <p>Advanced web crawling solutions for your business needs.</p>
        </div>
        <div className={styles.footerSection}>
          <h4 className={styles.footerSubtitle}>Quick Links</h4>
          <ul className={styles.footerList}>
            <li>
              <Link href="/" className={styles.footerLink}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/pricing" className={styles.footerLink}>
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/docs" className={styles.footerLink}>
                Documentation
              </Link>
            </li>
            <li>
              <Link href="/examples" className={styles.footerLink}>
                Examples
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h4 className={styles.footerSubtitle}>Resources</h4>
          <ul className={styles.footerList}>
            <li>
              <Link href="/blog" className={styles.footerLink}>
                Blog
              </Link>
            </li>
            <li>
              <Link href="/docs/api" className={styles.footerLink}>
                API Reference
              </Link>
            </li>
            <li>
              <Link href="/docs/guides" className={styles.footerLink}>
                Guides
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h4 className={styles.footerSubtitle}>Contact</h4>
          <ul className={styles.footerList}>
            <li>
              <Link href="/contact" className={styles.footerLink}>
                Contact Sales
              </Link>
            </li>
            <li>
              <Link href="/support" className={styles.footerLink}>
                Support
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>&copy; {currentYear} DataSpider. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
