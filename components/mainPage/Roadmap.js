import { useEffect } from "react"
import styles from "../../styles/Home.module.css"
import { Card } from "react-bootstrap"
import roadMapStyles from "../../styles/RoadMap.module.css"
import {
  LoadingSpinner,
  GreenCheckbox,
} from "../customComponents/buttons/LoadingSpinner"
import AOS from "aos"
import "aos/dist/aos.css" // You can also use <link> for styles

const RoadMap = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
    })
  }, [])
  return (
    <>
      <Card.Img
        variant="top"
        src="roadmap.png"
        className={styles.titlePhotoRoadMap}
        data-aos="fade-up"
      />
      <Card.Body>
        <h1 className={styles.description} data-aos="fade-up">
          Q3 2021
        </h1>
        <div className={roadMapStyles.timeline} data-aos="fade-up">
          <div
            className={`${roadMapStyles.container} ${roadMapStyles.right}`}
            data-aos="fade-up"
          >
            <div className={roadMapStyles.content}>
              <p>
                Launch web
                <GreenCheckbox />
              </p>
            </div>
          </div>
          <div
            className={`${roadMapStyles.container} ${roadMapStyles.right}`}
            data-aos="fade-up"
          >
            <div className={roadMapStyles.content}>
              <p>
                Finish the game
                <LoadingSpinner />
              </p>
            </div>
          </div>
          <div
            className={`${roadMapStyles.container} ${roadMapStyles.right}`}
            data-aos="fade-up"
          >
            <div className={roadMapStyles.content}>
              <p>
                Launch game on testnet
                <LoadingSpinner />
              </p>
            </div>
          </div>
          <h1 className={styles.description} data-aos="fade-up">
            Q4 2021
          </h1>
          <div
            className={`${roadMapStyles.container} ${roadMapStyles.right}`}
            data-aos="fade-up"
          >
            <div className={roadMapStyles.content}>
              <p>
                Launch ShibaWars season 1
                <LoadingSpinner />
              </p>
            </div>
          </div>
          <div
            className={`${roadMapStyles.container} ${roadMapStyles.right}`}
            data-aos="fade-up"
          >
            <div className={roadMapStyles.content}>
              <p>
                ShibaWars market place
                <LoadingSpinner />
              </p>
            </div>
          </div>
          <div
            className={`${roadMapStyles.container} ${roadMapStyles.right}`}
            data-aos="fade-up"
          >
            <div className={roadMapStyles.content}>
              <p>
                Community feedback
                <LoadingSpinner />
              </p>
            </div>
          </div>
          <h1 className={styles.description} data-aos="fade-up">
            Q1 2022
          </h1>
          <div
            className={`${roadMapStyles.container} ${roadMapStyles.right}`}
            data-aos="fade-up"
          >
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
