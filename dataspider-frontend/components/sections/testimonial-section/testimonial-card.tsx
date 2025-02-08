import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Quote } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  company: string;
  className?: string;
}

const TestimonialCard: FC<TestimonialCardProps> = ({
  quote,
  author,
  company,
  className,
}) => {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="pt-6">
        <Quote className="h-8 w-8 text-primary/20 mb-4" />
        <blockquote className="text-lg text-muted-foreground mb-4">
          {quote}
        </blockquote>
        <footer>
          <div className="font-semibold">{author}</div>
          <div className="text-sm text-muted-foreground">{company}</div>
        </footer>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
