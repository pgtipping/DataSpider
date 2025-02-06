import type { AppProps } from "next/app";
import Header from "../src/components/Header/Header";
import Footer from "../src/components/Footer/Footer";
import "../styles/globals.css";

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
