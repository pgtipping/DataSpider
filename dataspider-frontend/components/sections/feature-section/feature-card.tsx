import { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
}

const FeatureCard: FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  className,
}) => {
  return (
    <Card
      className={cn("transition-all duration-200 hover:shadow-lg", className)}
    >
      <CardContent className="pt-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-semibold tracking-tight">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
