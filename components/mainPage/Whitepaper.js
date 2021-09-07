import styles from "../../styles/Home.module.css"
import { Card, Container, Nav, NavDropdown } from "react-bootstrap"

const Whitepaper = () => {
  return (
    <>
      <Card.Img
        variant="top"
        src="WHITEPAPER.png"
        className={styles.titlePhotoWhitepaper}
      />{" "}
      <Card.Body className={styles.description}>
        You can read our whitepaper{" "}
        <a href="/shibawars_whitepaper.pdf" target="_blank">
          here
        </a>
      </Card.Body>
    </>
  )
}

export default Whitepaper
