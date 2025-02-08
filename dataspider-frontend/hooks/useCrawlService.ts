import { useState, useEffect } from "react";

export default function useCrawlService() {
  const [results, setResults] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:8001/ws");

    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "status") {
        setLogs((prev) => [...prev, message.message]);
      }
      if (message.type === "completed") {
        setResults(message.result);
      }
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const executeCrawl = async (config: any) => {
    try {
      const response = await fetch("http://localhost:8001/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, client_id: "123" }),
      });

      if (!response.ok) throw new Error("Crawl failed");
      const { job_id } = await response.json();

      // Poll for results
      const results = await fetch(
        `http://localhost:8001/api/results/${job_id}`
      );
      setResults(await results.json());
    } catch (error) {
      setLogs((prev) => [
        ...prev,
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ]);
    }
  };

  return { executeCrawl, results, logs };
}
