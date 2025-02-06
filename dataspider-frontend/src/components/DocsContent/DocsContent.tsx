import { FC } from "react";
import styles from "./DocsContent.module.css";

interface Section {
  id: string;
  title: string;
  content: string;
}

interface DocsContentProps {
  sections: Section[];
  activeSection: string;
}

const DocsContent: FC<DocsContentProps> = ({ sections, activeSection }) => {
  const currentSection = sections.find(
    (section) => section.id === activeSection
  );

  if (!currentSection) {
    return null;
  }

  return (
    <div className={styles.content}>
      <h2 className={styles.title}>{currentSection.title}</h2>
      <div className={styles.text}>{currentSection.content}</div>
    </div>
  );
};

export default DocsContent;
