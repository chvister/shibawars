import styles from "../../styles/Home.module.css"
import About from "./About"
import Whitepaper from "./Whitepaper"
import RoadMap from "./Roadmap"
import Team from "./Team"
import ContactUs from "./ContactUs"
import { Container } from "react-bootstrap"

const middleSection = () => {
  return (
    <Container className="col-xs-10 col-sm-10 col-md-10 col-lg-7 col-xl-7">
      <div id="about">
        <About />
      </div>
      <div className={styles.lineBreaker}></div>
      <div id="whitepaper">
        <Whitepaper />
      </div>
      <div className={styles.lineBreaker}></div>
      <div id="RoadMap">
        <RoadMap />
      </div>
      <div className={styles.lineBreaker}></div>
      <div id="team">
        <Team />
      </div>
      <div className={styles.lineBreaker}></div>
      <div>
        <ContactUs />
      </div>
      <div className={styles.lineBreaker}></div>
    </Container>
  )
}
export default middleSection
