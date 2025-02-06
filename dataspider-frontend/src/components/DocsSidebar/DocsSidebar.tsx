import { FC } from "react";
import styles from "./DocsSidebar.module.css";

interface Section {
  id: string;
  title: string;
  content: string;
}

interface DocsSidebarProps {
  sections: Section[];
  activeSection: string;
  setActiveSection: (id: string) => void;
}

const DocsSidebar: FC<DocsSidebarProps> = ({
  sections,
  activeSection,
  setActiveSection,
}) => {
  return (
    <nav className={styles.sidebar}>
      <ul className={styles.sectionList}>
        {sections.map((section) => (
          <li key={section.id}>
            <button
              className={`${styles.sectionButton} ${
                activeSection === section.id ? styles.active : ""
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DocsSidebar;
