import { FC } from "react";
import Link from "next/link";
import styles from "./Header.module.css";

interface User {
  name: string;
  email: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => void;
}

// Temporary mock until we implement the real auth store
const useAuthStore = (): AuthStore => ({
  isAuthenticated: false,
  user: null,
  logout: () => {},
});

const Header: FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">DataSpider</Link>
      </div>
      <nav className={styles.nav}>
        <ul>
          <li>
            <Link href="/" className={styles.navLink}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/docs" className={styles.navLink}>
              Documentation
            </Link>
          </li>
          <li>
            <Link href="/examples" className={styles.navLink}>
              Examples
            </Link>
          </li>
          <li>
            <Link href="/pricing" className={styles.navLink}>
              Pricing
            </Link>
          </li>
          <li>
            <Link href="/about" className={styles.navLink}>
              About
            </Link>
          </li>
          {isAuthenticated && user ? (
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
              <Link href="/contact" className={styles.ctaButton}>
                Contact Sales
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
