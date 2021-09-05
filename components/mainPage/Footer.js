import Image from "next/image"
import styles from "../../styles/Home.module.css"
import { SocialIcon } from "react-social-icons"
import { Container, Card } from "react-bootstrap"

const Footer = () => {
  return (
    <Card.Footer style={{ border: "none", marginTop: "8rem" }}>
      <Container style={{ textAlign: "center" }}>
        <SocialIcon
          url="https://twitter.com/shibawars"
          style={{ height: 40, width: 40, margin: "20px 5px" }}
          fgColor="white"
        />
        <SocialIcon
          url="https://discord.com/shibawars"
          style={{ height: 40, width: 40, margin: "20px 5px" }}
          fgColor="white"
        />
        <SocialIcon
          url="https://reddit.com/shibawars"
          style={{ height: 40, width: 40, margin: "20px 5px" }}
          fgColor="white"
        />
        <div>&copy; 2021 Kriko &amp; Friends </div>
      </Container>
    </Card.Footer>
  )
}

export default Footer
