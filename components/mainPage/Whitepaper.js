import styles from "../../styles/Home.module.css"
import { Card, Container, Nav, NavDropdown } from "react-bootstrap"

const Whitepaper = () => {
  return (
    <>
      <h1 className={styles.title}>Read our whitepaper</h1>
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
