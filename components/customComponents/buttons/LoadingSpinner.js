import styles from "./spinner.module.css"

export const LoadingSpinner = () => {
  return (
    <div className={`${styles.ldsRing}`}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

export const GreenCheckbox = () => {
  return (
    <div className={styles.round}>
      <input type="checkbox" id="checkbox" />
      <label for="checkbox" defaultChecked={true}></label>
    </div>
  )
}
