"use client";

import { FC } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface PricingPlanProps {
  title: string;
  price: number | null;
  priceText?: string;
  period?: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  highlighted: boolean;
}

const PricingPlan: FC<PricingPlanProps> = ({
  title,
  price,
  priceText,
  period,
  features,
  ctaText,
  ctaLink,
  highlighted,
}) => {
  return (
    <Card
      className={`relative p-6 ${
        highlighted ? "border-primary shadow-lg" : "border-border"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
          Most Popular
        </div>
      )}
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-4 mb-6">
        {price !== null ? (
          <div className="flex items-baseline">
            <span className="text-4xl font-bold">${price}</span>
            {period && (
              <span className="ml-1 text-muted-foreground">/{period}</span>
            )}
          </div>
        ) : (
          <span className="text-4xl font-bold">{priceText}</span>
        )}
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        asChild
        className="w-full"
        variant={highlighted ? "default" : "outline"}
      >
        <Link href={ctaLink}>{ctaText}</Link>
      </Button>
    </Card>
  );
};

export default PricingPlan;
