import Head from "next/head"
import PageWrapper from "../components/mainPage/PageWrapper"
import React from "react"
import styles from "../styles/Home.module.css"

import "bootstrap/dist/css/bootstrap.min.css"

export default function Home() {
  return (
    <>
      <Head>
        <title>Shibawars</title>
        <link rel="icon" href="/shibawars_logo_new.png" />
      </Head>
      <div className={styles.pageBackgroundColor}>
        <PageWrapper />
      </div>
    </>
  )
}
