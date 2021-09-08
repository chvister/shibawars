import Head from "next/head"
import Footer from "../components/mainPage/Footer"
import NavbarApp from "../components/NavbarApp"
import styles from "../styles/Home.module.css"
import Dog from "../components/Dog"
import { useMoralis } from "react-moralis"
import { useEffect } from "react"

export default function MyDogs() {
  const { isAuthenticated, enableWeb3, isWeb3Enabled } = useMoralis();

  useEffect(() => {
    //if(isAuthenticated) {
      enableWeb3()
    //}
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Shibawars</title>
        <link rel="icon" href="/shibawars_logo_new.png" />
      </Head>

      <NavbarApp />
      <main className={styles.main}>
        <div className={styles.section_app}>
          <h1 className={styles.title}>My Dogs</h1>
          <p className={styles.description}>Here are your dogs.</p>
            {
              isAuthenticated && isWeb3Enabled ? 
              <div className={styles.gridContainer}>
                <Dog dogUrl={"/kriko.jpg"} />
                <Dog dogUrl={"/kriko.jpg"} />
                <Dog dogUrl={"/kriko.jpg"} />
                <Dog dogUrl={"/kriko.jpg"} />
                <Dog dogUrl={"/kriko.jpg"} />
                <Dog dogUrl={"/kriko.jpg"} />
                <Dog dogUrl={"/kriko.jpg"} />
                <Dog dogUrl={"/kriko.jpg"} />
                </div>
              : null
            }
        </div>
      </main>

      <Footer />
    </div>
  )
}
