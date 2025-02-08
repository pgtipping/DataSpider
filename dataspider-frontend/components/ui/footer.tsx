import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">DataSpider</h3>
            <p className="text-sm text-muted-foreground">
              Powerful web crawling and data extraction platform for developers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/examples"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Examples
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Changelog
                </Link>
              </li>
              <li>
                <Link
                  href="/status"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Status
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} DataSpider. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
