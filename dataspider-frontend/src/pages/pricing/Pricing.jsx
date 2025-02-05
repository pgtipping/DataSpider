import styles from "./Pricing.module.css"
import PricingPlan from "../../components/PricingPlan/PricingPlan"

const pricingPlans = [
  {
    name: "Starter",
    price: "$49",
    period: "per month",
    features: ["100,000 requests per month", "Basic API access", "Email support", "Single-threaded crawling"],
    cta: "Start Free Trial",
  },
  {
    name: "Professional",
    price: "$199",
    period: "per month",
    features: [
      "1,000,000 requests per month",
      "Advanced API access",
      "Priority email support",
      "Multi-threaded crawling",
      "Custom extraction rules",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    features: [
      "Unlimited requests",
      "Full API access",
      "24/7 phone and email support",
      "Dedicated crawling infrastructure",
      "Custom integrations",
      "Service Level Agreement (SLA)",
    ],
    cta: "Contact Sales",
  },
]

const PricingPage = () => {
  return (
    <div className={styles.pricingPage}>
      <h1 className={styles.pageTitle}>Choose Your Plan</h1>
      <p className={styles.pageSubtitle}>Select the perfect plan for your web crawling needs</p>
      <div className={styles.pricingGrid}>
        {pricingPlans.map((plan, index) => (
          <PricingPlan key={index} {...plan} />
        ))}
      </div>
    </div>
  )
}

export default PricingPage

