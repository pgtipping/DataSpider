import styles from "./PricingPlan.module.css"

const PricingPlan = ({ name, price, period, features, cta, highlighted }) => {
  return (
    <div className={`${styles.pricingPlan} ${highlighted ? styles.highlighted : ""}`}>
      <h2 className={styles.planName}>{name}</h2>
      <div className={styles.planPrice}>
        <span className={styles.price}>{price}</span>
        <span className={styles.period}>{period}</span>
      </div>
      <ul className={styles.featureList}>
        {features.map((feature, index) => (
          <li key={index} className={styles.feature}>
            {feature}
          </li>
        ))}
      </ul>
      <button className={styles.ctaButton}>{cta}</button>
    </div>
  )
}

export default PricingPlan

