import { useState } from "react";
import { Button } from "@/components/ui/button";
import ConfigForm from "@/components/playground/ConfigForm";
import RealTimeLog from "@/components/playground/RealTimeLog";
import ResultViewer from "@/components/playground/ResultViewer";
import useCrawlService from "@/hooks/useCrawlService";

export default function Playground() {
  const [activeTab, setActiveTab] = useState("config");
  const { executeCrawl, results, logs } = useCrawlService();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          DataSpider Playground
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm">
            <ConfigForm onSubmit={executeCrawl} />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex gap-4 mb-4">
                <Button
                  variant={activeTab === "logs" ? "default" : "outline"}
                  onClick={() => setActiveTab("logs")}
                >
                  Live Logs
                </Button>
                <Button
                  variant={activeTab === "results" ? "default" : "outline"}
                  onClick={() => setActiveTab("results")}
                >
                  Results
                </Button>
              </div>

              {activeTab === "logs" && <RealTimeLog logs={logs} />}
              {activeTab === "results" && <ResultViewer results={results} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
