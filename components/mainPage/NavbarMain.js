import Link from "next/link"
import { Button } from "@material-ui/core"
import Image from "next/image"
import styles from "../../styles/Home.module.css"
import { Card, Row, Col, NavDropdown } from "react-bootstrap"

const NavbarMain = () => {
  return (
    <div className={styles.navbar}>
      <div>
        {/* <Image
          src="/shibawars_logo_title_new.png"
          alt="Shibawars"
          width={1024}
          height={256}
        /> */}
        <Card.Img
          variant="top"
          src="/shibawars_title.png"
          style={{ width: "80%", margin: "auto", display: "block" }}
        />
      </div>
      <div>
        <Link href="/my_dogs" passHref>
          <Button variant="contained">Enter app</Button>
        </Link>
        <Link href="/shibawars_whitepaper.pdf" passHref>
          <Button target="_blank" variant="contained">
            Whitepaper
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NavbarMain
