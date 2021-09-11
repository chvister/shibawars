import styles from "../../styles/Home.module.css"
import { Card } from "react-bootstrap"
import roadMapStyles from "../../styles/RoadMap.module.css"
import {
  LoadingSpinner,
  GreenCheckbox,
} from "../customComponents/buttons/LoadingSpinner"
const RoadMap = () => {
  return (
    <>
      <Card.Img
        variant="top"
        src="roadmap.png"
        className={styles.titlePhotoRoadMap}
      />

      <Card.Body>
        <h1 className={styles.description}>Q3 2021</h1>
        <div className={roadMapStyles.timeline}>
          <div className={`${roadMapStyles.container} ${roadMapStyles.right}`}>
            <div className={roadMapStyles.content}>
              <p>
                Launch web
                <GreenCheckbox />
              </p>
            </div>
          </div>
          <div className={`${roadMapStyles.container} ${roadMapStyles.right}`}>
            <div className={roadMapStyles.content}>
              <p>
                Finish the game
                <LoadingSpinner />
              </p>
            </div>
          </div>
          <div className={`${roadMapStyles.container} ${roadMapStyles.right}`}>
            <div className={roadMapStyles.content}>
              <p>
                Launch game on testnet
                <LoadingSpinner />
              </p>
            </div>
          </div>
          <h1 className={styles.description}>Q4 2021</h1>
          <div className={`${roadMapStyles.container} ${roadMapStyles.right}`}>
            <div className={roadMapStyles.content}>
              <p>
                Launch ShibaWars season 1
                <LoadingSpinner />
              </p>
            </div>
          </div>
          <div className={`${roadMapStyles.container} ${roadMapStyles.right}`}>
            <div className={roadMapStyles.content}>
              <p>
                ShibaWars market place
                <LoadingSpinner />
              </p>
            </div>
          </div>
          <div className={`${roadMapStyles.container} ${roadMapStyles.right}`}>
            <div className={roadMapStyles.content}>
              <p>
                Community feedback
                <LoadingSpinner />
              </p>
            </div>
          </div>
          <h1 className={styles.description}>Q1 2022</h1>
          <div className={`${roadMapStyles.container} ${roadMapStyles.right}`}>
            <div className={roadMapStyles.content}>
              <p>
                Launch ShibaWars season 2
                <LoadingSpinner />
              </p>
            </div>
          </div>
        </div>
      </Card.Body>
    </>
  )
}

export default RoadMap
