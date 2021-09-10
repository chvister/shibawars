import { SocialIcon } from "react-social-icons"
import { Container, Card } from "react-bootstrap"
import styles from "../../styles/Home.module.css"

const Footer = () => {
  return (
    <>
      <Card.Footer
        style={{ border: "none", marginTop: "8rem", background: "#262626" }}
      >
        <Container style={{ textAlign: "center" }}>
          <SocialIcon
            url="https://twitter.com/shibawars"
            style={{ height: 40, width: 40, margin: "20px 5px" }}
            fgColor="white"
            target="_blank"
            rel="noopener noreferrer"
          />
          {/* <SocialIcon
          url="https://discord.com/shibawars"
          style={{ height: 40, width: 40, margin: "20px 5px" }}
          fgColor="white"
          target="_blank"
          rel="noopener noreferrer"
        /> */}
          <SocialIcon
            url="https://www.reddit.com/r/ShibaWars/"
            style={{ height: 40, width: 40, margin: "20px 5px" }}
            fgColor="white"
            target="_blank"
            rel="noopener noreferrer"
          />
          <SocialIcon
            url="https://github.com/coreggon11/shibawars"
            style={{ height: 40, width: 40, margin: "20px 5px" }}
            fgColor="white"
            target="_blank"
            rel="noopener noreferrer"
          />
          <div className={styles.footerText}>&copy; 2021 Naakka Studio </div>
        </Container>
      </Card.Footer>
    </>
  )
}

export default Footer
