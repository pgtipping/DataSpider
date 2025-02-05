import styles from "./Home.module.css"
import HeroSection from "../../components/HeroSection/HeroSection"
import FeatureSection from "../../components/FeatureSection/FeatureSection"
import TestimonialSection from "../../components/TestimonialSection/TestimonialSection"
import FAQSection from "../../components/FAQSection/FAQSection"
import TryItNow from "../../components/TryItNow/TryItNow"

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <HeroSection />
      <FeatureSection />
      <TryItNow />
      <TestimonialSection />
      <FAQSection />
    </div>
  )
}

export default HomePage

