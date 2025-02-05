import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import useAuthStore from "../../store/authStore";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">DataSpider</Link>
      </div>
      <nav className={styles.nav}>
        <ul>
          <li>
            <Link to="/" className={styles.navLink}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/pricing" className={styles.navLink}>
              Pricing
            </Link>
          </li>
          <li>
            <Link to="/docs" className={styles.navLink}>
              Docs
            </Link>
          </li>
          <li>
            <Link to="/about" className={styles.navLink}>
              About
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              <li>
                <span className={styles.userGreeting}>Hello, {user.name}</span>
              </li>
              <li>
                <button onClick={logout} className={styles.ctaButton}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <a href="#contact" className={styles.ctaButton}>
                Contact Sales
              </a>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
