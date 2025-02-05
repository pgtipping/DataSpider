import styles from "./FeatureCard.module.css"

const FeatureCard = ({ title, description, icon }) => {
  return (
    <div className={styles.featureCard}>
      <div className={styles.iconContainer}>{icon}</div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDescription}>{description}</p>
    </div>
  )
}

export default FeatureCard

