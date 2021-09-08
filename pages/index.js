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
        <meta property="og:title" content="Shibawars" key="title" />
        <meta property="og:image" content="/shibawars_logo_new.png"/>
        <meta property="og:description" content="Fight with your Shiba Inus in the arena to compete for the prizepool!"/>
      </Head>
      <div className={styles.pageBackgroundColor}>
        <PageWrapper />
      </div>
    </>
  )
}
