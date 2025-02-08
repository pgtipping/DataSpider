import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={item.href} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            )}
            <Link
              href={item.href}
              className={`inline-flex items-center text-sm ${
                index === items.length - 1
                  ? "text-gray-500 cursor-default"
                  : "text-primary hover:text-primary/80"
              }`}
              {...(index === items.length - 1 && { "aria-current": "page" })}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
