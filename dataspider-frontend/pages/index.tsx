import { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";

// Dynamic imports for client components
const HeroSection = dynamic(
  () => import("@/components/sections/hero-section"),
  {
    ssr: false,
  }
);
const FeatureSection = dynamic(
  () => import("@/components/sections/feature-section/feature-section"),
  {
    ssr: false,
  }
);
const TestimonialSection = dynamic(
  () => import("@/components/sections/testimonial-section/testimonial-section"),
  {
    ssr: false,
  }
);
const FAQSection = dynamic(() => import("@/components/sections/faq-section"), {
  ssr: false,
});
const TryItNow = dynamic(
  () => import("@/components/try-it-now").then((mod) => mod.TryItNow),
  {
    ssr: false,
  }
);

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>DataSpider - Advanced Web Crawling Solutions</title>
        <meta
          name="description"
          content="Advanced web crawling solutions for your business needs"
        />
      </Head>
      <div>
        <HeroSection />
        <FeatureSection />
        <TestimonialSection />
        <FAQSection />
        <TryItNow />
      </div>
    </>
  );
};

export default HomePage;
