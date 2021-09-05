import Head from "next/head"
import Footer from "../components/mainPage/Footer"
import NavbarApp from "../components/NavbarApp"
import styles from "../styles/Home.module.css"
import Dog from "../components/Dog"

export default function MyDogs() {
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
        </div>
      </main>

      <Footer />
    </div>
  )
}
