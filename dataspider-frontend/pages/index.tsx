import { NextPage } from "next";
import Head from "next/head";
import HeroSection from "../src/components/HeroSection/HeroSection";
import FeatureSection from "../src/components/FeatureSection/FeatureSection";
import TestimonialSection from "../src/components/TestimonialSection/TestimonialSection";
import FAQSection from "../src/components/FAQSection/FAQSection";
import TryItNow from "../src/components/TryItNow/TryItNow";

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
