import Head from 'next/head'
import Footer from '../components/Footer'
import NavbarApp from '../components/NavbarApp'
import styles from '../styles/Home.module.css'
import DogShop from '../components/DogShop'
import LeashShop from '../components/LeashShop'

export default function Shop() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Shibawars</title>
        <link rel="icon" href="/shibawars_logo_new.png" />
      </Head>

      <NavbarApp/>
      <main className={styles.main}>
      
        <div className={styles.section_app}>
          <h1 className={styles.title}>Shop</h1>
          <p className={styles.description}>
            Here you can buy a new Shiba Inu
          </p>
          <div className={styles.gridContainer}>
            <DogShop dogName={"Doge Killer"} dogPrice={100000000} dogUrl={"/kriko.jpg"}/>
            <DogShop dogName={"Aggresive Shiba Inu"} dogPrice={20000000} dogUrl={"/kriko.jpg"}/>
            <DogShop dogName={"Bored Shiba Inu"} dogPrice={10000000} dogUrl={"/kriko.jpg"}/>
            <DogShop dogName={"Shiba Inu"} dogPrice={5000000} dogUrl={"/kriko.jpg"}/>
            <DogShop dogName={"Aggresive Shiba Pup"} dogPrice={2500000} dogUrl={"/kriko.jpg"}/>
            <DogShop dogName={"Shiba Pup"} dogPrice={500000} dogUrl={"/kriko.jpg"}/>
            <DogShop dogName={"Lucky Shiba Pack"} dogPrice={4000000} dogUrl={"/kriko.jpg"}/>
            <LeashShop leashName={"Diamond Leash"} leashPrice={10} leashUrl={"/kriko.jpg"}/>
            <LeashShop leashName={"Golden Leash"} leashPrice={1} leashUrl={"/kriko.jpg"}/>
            <LeashShop leashName={"Silver Leash"} leashPrice={0.1} leashUrl={"/kriko.jpg"}/>
            <LeashShop leashName={"Iron Leash"} leashPrice={0.01} leashUrl={"/kriko.jpg"}/>
          </div>
        </div>
      
      </main>

      <Footer/>
    </div>
  )
}