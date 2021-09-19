import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@material-ui/core"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { useMoralis } from "react-moralis"
import CircularProgress from "@material-ui/core/CircularProgress"
import AlertDialog from "./AlertDialog"

const NavbarApp = () => {
  const [windowWidth, setWidth] = useState()
  const { authenticate, isAuthenticated, authError, isAuthenticating, logout } =
    useMoralis()
  // const componentDidMount = () => {
  //   console.log("window.innerHeight", window.innerHeight)
  // }
  // componentDidMount()
  console.log(global)
  useEffect(() => {
    setWidth(global.innerWidth)
    console.log(windowWidth)
  })
  return (
    <div className={styles.navbarColor}>
      <div className={styles.navbar}>
        <div className={styles.navbarPadding}>
          <Image
            src="/shibawars_logo_title_new.png"
            alt="Shibawars"
            width={1024}
            height={256}
          />
        </div>
      </div>
      <div>
        {authError ? (
          <AlertDialog title={"Error"} text={authError.message} />
        ) : null}
        <div className={styles.navbarButtonsWrapper}>
          {isAuthenticated ? null : (
            <button
              className={styles.navbarButton}
              onClick={() => authenticate()}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? <CircularProgress size={20} /> : "Login"}
            </button>
          )}
          {/* <Link href="/my_dogs" passHref>
            <Button variant="contained">My Dogs</Button>
          </Link> */}
          <Link href="/my_dogs" passHref>
            <button className={styles.navbarButton}>My Dogs</button>
          </Link>
          <Link href="/arena" passHref>
            <button className={styles.navbarButton}>Arena</button>
          </Link>
          <Link href="/shop" passHref>
            <button className={styles.navbarButton}>Shop</button>
          </Link>
          {isAuthenticated ? (
            <button className={styles.navbarButton} onClick={() => logout()}>
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default NavbarApp
