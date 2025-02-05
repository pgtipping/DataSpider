import { Link } from "react-router-dom"
import styles from "./Footer.module.css"

const Footer = () => {
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
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/pricing">Pricing</Link>
            </li>
            <li>
              <Link to="/docs">Documentation</Link>
            </li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h4 className={styles.footerSubtitle}>Contact</h4>
          <ul className={styles.footerList}>
            <li>Email: info@dataspider.com</li>
            <li>Phone: +1 (123) 456-7890</li>
          </ul>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>&copy; 2023 DataSpider. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer

