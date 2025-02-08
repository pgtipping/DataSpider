import { FC, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
  content: string;
}

interface DocsSearchProps {
  sections: Section[];
  setActiveSection: (id: string) => void;
  className?: string;
}

const DocsSearch: FC<DocsSearchProps> = ({
  sections,
  setActiveSection,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Section[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.length > 2) {
      const results = sections.filter(
        (section) =>
          section.title.toLowerCase().includes(term) ||
          section.content.toLowerCase().includes(term)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleResultClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search documentation..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-9"
          aria-label="Search documentation"
        />
      </div>
      {searchResults.length > 0 && (
        <ul
          className="absolute z-50 mt-2 w-full rounded-md border bg-popover p-2 shadow-md"
          role="listbox"
        >
          {searchResults.map((result) => (
            <li key={result.id} role="option">
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => handleResultClick(result.id)}
              >
                {result.title}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocsSearch;
