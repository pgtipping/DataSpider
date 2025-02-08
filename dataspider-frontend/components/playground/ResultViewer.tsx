import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert } from "@/components/ui/alert";

export default function ResultViewer({ results }: { results: any }) {
  if (!results) {
    return <Alert variant="default">No results yet - Run a crawl first!</Alert>;
  }

  return (
    <Tabs defaultValue="raw" className="w-full">
      <TabsList>
        <TabsTrigger value="raw">Raw Data</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="pdf">PDF</TabsTrigger>
      </TabsList>

      <TabsContent value="raw">
        <ScrollArea className="h-96">
          <pre className="p-4 text-sm">{JSON.stringify(results, null, 2)}</pre>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="preview">
        <iframe
          srcDoc={results?.result?.content || "<p>No preview available</p>"}
          className="w-full h-96 border rounded"
        />
      </TabsContent>

      <TabsContent value="pdf">
        {results?.pdf_url ? (
          <iframe
            src={results.pdf_url}
            className="w-full h-96 border rounded"
          />
        ) : (
          <Alert variant="destructive">PDF not generated for this crawl</Alert>
        )}
      </TabsContent>
    </Tabs>
  );
}
