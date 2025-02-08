import { FC, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const answerId = `faq-answer-${question.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="border-b border-gray-200 py-4">
      <h3>
        <button
          className="flex w-full items-center justify-between text-left text-lg font-medium text-gray-900 hover:text-primary"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={answerId}
          type="button"
        >
          {question}
          <ChevronDown
            className={cn(
              "h-5 w-5 text-gray-500 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>
      </h3>
      <div
        id={answerId}
        className={cn("mt-2 text-gray-600", !isOpen && "hidden")}
        role="region"
        aria-labelledby={`${answerId}-button`}
      >
        <p className="prose max-w-none">{answer}</p>
      </div>
    </div>
  );
};

export default FAQItem;
