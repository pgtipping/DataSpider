import styles from "./LoadingSpinner.module.css"

const LoadingSpinner = () => {
  return (
    <div className={styles.spinnerOverlay}>
      <div className={styles.spinner}></div>
    </div>
  )
}

export default LoadingSpinner

