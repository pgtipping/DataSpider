import { FC } from "react";
import Link from "next/link";
import styles from "./PricingPlan.module.css";

interface PricingPlanProps {
  title: string;
  price: number | null;
  priceText?: string;
  period?: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  highlighted: boolean;
}

const PricingPlan: FC<PricingPlanProps> = ({
  title,
  price,
  priceText,
  period,
  features,
  ctaText,
  ctaLink,
  highlighted,
}) => {
  return (
    <div
      className={`${styles.pricingPlan} ${
        highlighted ? styles.highlighted : ""
      }`}
    >
      <h2 className={styles.planName}>{title}</h2>
      <div className={styles.planPrice}>
        {price !== null ? (
          <>
            <span className={styles.price}>${price}</span>
            {period && <span className={styles.period}>/{period}</span>}
          </>
        ) : (
          <span className={styles.price}>{priceText}</span>
        )}
      </div>
      <ul className={styles.featureList}>
        {features.map((feature, index) => (
          <li key={index} className={styles.feature}>
            {feature}
          </li>
        ))}
      </ul>
      <Link href={ctaLink} className={styles.ctaButton}>
        {ctaText}
      </Link>
    </div>
  );
};

export default PricingPlan;
