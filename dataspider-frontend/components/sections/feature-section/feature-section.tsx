import { FC } from "react";
import FeatureCard from "./feature-card";
import { Bug, Database, LayoutGrid, LineChart, LucideIcon } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

const features: Feature[] = [
  {
    title: "Advanced Crawling",
    description:
      "Our sophisticated algorithms ensure thorough and efficient web crawling.",
    icon: Bug,
  },
  {
    title: "Data Extraction",
    description:
      "Extract structured data from any website with ease and accuracy.",
    icon: Database,
  },
  {
    title: "Scalable Infrastructure",
    description:
      "Handle millions of requests with our robust and scalable architecture.",
    icon: LayoutGrid,
  },
  {
    title: "Real-time Monitoring",
    description:
      "Monitor your crawling jobs in real-time with detailed analytics.",
    icon: LineChart,
  },
];

const FeatureSection: FC = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
          Why Choose DataSpider?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={<Icon className="h-6 w-6" />}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
