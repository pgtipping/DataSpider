import { FC } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const HeroSection: FC = () => {
  return (
    <section className="w-full min-h-[80vh] flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container px-4 md:px-6 text-center space-y-8"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
          Advanced Web Crawling{" "}
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Made Simple
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
          Extract, analyze, and structure web data with powerful AI-driven tools
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/examples">Try it Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/docs">View Documentation</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
