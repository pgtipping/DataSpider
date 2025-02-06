import { NextPage } from "next";
import Head from "next/head";
import Breadcrumb from "../src/components/Breadcrumb/Breadcrumb";
import PricingPlan from "../src/components/PricingPlan/PricingPlan";
import FAQSection from "../src/components/FAQSection/FAQSection";
import TryItNow from "../src/components/TryItNow/TryItNow";

const pricingPlans = [
  {
    title: "Starter",
    price: 49,
    period: "month",
    features: [
      "100,000 requests per month",
      "Basic API access",
      "Email support",
    ],
    ctaText: "Start Free Trial",
    ctaLink: "/signup",
    highlighted: false,
  },
  {
    title: "Professional",
    price: 199,
    period: "month",
    features: [
      "1,000,000 requests per month",
      "Advanced API access",
      "Priority email support",
      "Custom extraction rules",
    ],
    ctaText: "Start Free Trial",
    ctaLink: "/signup",
    highlighted: true,
  },
  {
    title: "Enterprise",
    price: null,
    priceText: "Custom",
    features: [
      "Unlimited requests",
      "Full API access",
      "24/7 phone and email support",
      "Custom integrations",
    ],
    ctaText: "Contact Sales",
    ctaLink: "/contact",
    highlighted: false,
  },
];

const PricingPage: NextPage = () => {
  const breadcrumbItems = [{ label: "Pricing", href: "/pricing" }];

  return (
    <>
      <Head>
        <title>DataSpider Pricing - Plans and Packages</title>
        <meta
          name="description"
          content="Explore DataSpider's flexible pricing plans for web crawling services. Choose from Starter, Professional, and Enterprise packages to match your needs."
        />
      </Head>
      <div>
        <section className="py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <Breadcrumb items={breadcrumbItems} />
            <h1 className="text-4xl font-bold text-center mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 text-center mb-12">
              Choose the plan that best fits your needs
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <PricingPlan key={index} {...plan} />
              ))}
            </div>
          </div>
        </section>
        <FAQSection />
        <TryItNow />
      </div>
    </>
  );
};

export default PricingPage;
