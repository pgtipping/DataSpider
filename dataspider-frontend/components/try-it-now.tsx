"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface CrawlResult {
  jobId: string;
  status: "in_progress" | "completed" | "failed";
  estimatedCompletionTime: string;
}

export function TryItNow() {
  const [url, setUrl] = useState("");
  const [depth, setDepth] = useState(1);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    // Simulating API call
    setTimeout(() => {
      setResult({
        jobId: Math.random().toString(36).substr(2, 9),
        status: "in_progress",
        estimatedCompletionTime: new Date(Date.now() + 60000).toISOString(),
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Try DataSpider Now
          </CardTitle>
        </CardHeader>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  URL to crawl:
                </label>
                <Input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setUrl(e.target.value)
                  }
                  required
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="depth" className="text-sm font-medium">
                  Crawl depth:
                </label>
                <Input
                  type="number"
                  id="depth"
                  value={depth}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setDepth(Number.parseInt(e.target.value))
                  }
                  min="1"
                  max="5"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Start Crawl"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Crawl Job Started</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Job ID:</span> {result.jobId}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span className="capitalize">{result.status}</span>
                </p>
                <p>
                  <span className="font-medium">Estimated Completion:</span>{" "}
                  {new Date(result.estimatedCompletionTime).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
