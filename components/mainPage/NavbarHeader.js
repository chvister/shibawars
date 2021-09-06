import { Navbar, Container, Nav, Card } from "react-bootstrap"
import React from "react"
import { Link } from "react-scroll"
import styles from "../../styles/Home.module.css"

const NavbarHeader = () => {
  return (
    <div className={styles.navbarHeaderWrapper}>
      <Navbar expand="lg" variant="dark">
        <Container>
          <Card.Img
            variant="top"
            src="/shibawars_head.png"
            className={styles.navbarLogo}
          />
          {/* <Card.Img
          variant="top"
          src="/shibawars_title.png"
          style={{ width: "120px" }}
        /> */}
          {/* <Navbar.Brand>Shibawars</Navbar.Brand> */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto" className>
              <div>
                <Link to="about" className={styles.link + " " + styles.links}>
                  About
                </Link>
              </div>
              <div>
                <Link
                  to="whitepaper"
                  className={styles.link + " " + styles.links}
                >
                  Whitepaper
                </Link>
              </div>
              <div>
                <Link to="team" className={styles.link + " " + styles.links}>
                  Team
                </Link>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  )
}
export default NavbarHeader
