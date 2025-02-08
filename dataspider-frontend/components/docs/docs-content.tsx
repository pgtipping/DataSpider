import { FC } from "react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
  content: string;
}

interface DocsContentProps {
  sections: Section[];
  activeSection: string;
  className?: string;
}

const DocsContent: FC<DocsContentProps> = ({
  sections,
  activeSection,
  className,
}) => {
  const currentSection = sections.find(
    (section) => section.id === activeSection
  );

  if (!currentSection) {
    return null;
  }

  return (
    <div
      className={cn(
        "prose prose-gray dark:prose-invert max-w-none p-6",
        className
      )}
    >
      <h2 className="text-3xl font-bold tracking-tight mb-4">
        {currentSection.title}
      </h2>
      <div className="text-muted-foreground">{currentSection.content}</div>
    </div>
  );
};

export default DocsContent;
