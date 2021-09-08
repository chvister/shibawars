import Link from "next/link"
import styles from "../../styles/Home.module.css"
import { Card, Row, Col, NavDropdown } from "react-bootstrap"

const NavbarMain = () => {
  return (
    <div className={styles.navbar}>
      <div>
        <Card.Img
          variant="top"
          src="/shibawars_title.png"
          style={{ width: "80%", margin: "auto", display: "block" }}
        />
      </div>
      <div className={styles.navbarButtonsWrapper}>
        <Link href="/my_dogs" passHref>
          <button className={styles.navbarButton} disabled={true}>
            Enter app
          </button>
        </Link>
        <Link href="/shibawars_whitepaper_103.pdf">
          <a target="_blank">
            <button className={styles.navbarButton}>Whitepaper</button>
          </a>
        </Link>
      </div>
    </div>
  )
}

export default NavbarMain
