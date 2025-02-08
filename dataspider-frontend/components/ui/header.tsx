import React from "react";
import Link from "next/link";
import { Button } from "./button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center max-w-7xl mx-auto px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">DataSpider</span>
        </Link>
        <nav className="flex items-center ml-auto space-x-6">
          <Link
            href="/examples"
            className="text-sm font-medium hover:text-primary"
          >
            Examples
          </Link>
          <Link href="/docs" className="text-sm font-medium hover:text-primary">
            Documentation
          </Link>
          <Link
            href="/playground"
            className="text-sm font-medium hover:text-primary"
          >
            Playground
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium hover:text-primary"
          >
            Pricing
          </Link>
          <Button asChild variant="default" size="sm">
            <Link href="/try-now">Try Now</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
