import {
  useForm,
  SubmitHandler,
  FieldValues,
  ControllerRenderProps,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";

interface ConfigFormProps {
  onSubmit: SubmitHandler<FieldValues>;
}

interface BrowserConfig {
  headless: boolean;
  waitUntil: string;
}

interface CrawlerConfig {
  url: string;
  strategy: string;
}

interface FormValues {
  browser: BrowserConfig;
  crawler: CrawlerConfig;
}

export default function ConfigForm({ onSubmit }: ConfigFormProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      browser: {
        headless: true,
        waitUntil: "load",
      },
      crawler: {
        url: "https://example.com",
        strategy: "auto",
      },
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="crawler.url"
          render={({
            field,
          }: {
            field: ControllerRenderProps<FormValues, "crawler.url">;
          }) => (
            <FormItem>
              <FormLabel>Target URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="crawler.strategy"
          render={({
            field,
          }: {
            field: ControllerRenderProps<FormValues, "crawler.strategy">;
          }) => (
            <FormItem>
              <FormLabel>Crawling Strategy</FormLabel>
              <FormControl>
                <Input placeholder="auto" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Execute Crawl
        </Button>
      </form>
    </Form>
  );
}
