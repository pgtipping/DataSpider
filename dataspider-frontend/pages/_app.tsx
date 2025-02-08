import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Component {...pageProps} />
      </main>
      <Footer />
    </>
  );
}
