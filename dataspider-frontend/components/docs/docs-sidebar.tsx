import { FC } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Section {
  id: string;
  title: string;
  content: string;
}

interface DocsSidebarProps {
  sections: Section[];
  activeSection: string;
  setActiveSection: (id: string) => void;
  className?: string;
}

const DocsSidebar: FC<DocsSidebarProps> = ({
  sections,
  activeSection,
  setActiveSection,
  className,
}) => {
  return (
    <nav className={cn("w-64 border-r bg-background", className)}>
      <ul className="space-y-1 p-4">
        {sections.map((section) => (
          <li key={section.id}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-left font-normal",
                activeSection === section.id &&
                  "bg-muted font-medium text-foreground"
              )}
              onClick={() => setActiveSection(section.id)}
            >
              {section.title}
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DocsSidebar;
