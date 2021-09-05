import React from "react"
import NavbarMain from "./NavbarMain"
import Footer from "./Footer"
import NavbarHeader from "./NavbarHeader"
import MiddleSection from "./MiddleSection"
import styles from "../../styles/Home.module.css"

const MainContent = () => {
  return (
    <>
      <div className={styles.navbarColor}>
        <NavbarHeader />
        <NavbarMain />
      </div>

      <MiddleSection />
      <Footer className="title" />
    </>
  )
}

export default MainContent
