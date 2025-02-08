import { ScrollArea } from "@/components/ui/scroll-area";

export default function RealTimeLog({ logs }: { logs: string[] }) {
  return (
    <ScrollArea className="h-96 rounded-md border p-4">
      <div className="space-y-2">
        {logs.map((log, index) => (
          <div key={index} className="text-sm font-mono">
            {log}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
