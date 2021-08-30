import Head from 'next/head'
import NavbarMain from '../components/NavbarMain'
import styles from '../styles/Home.module.css'
import Image from 'next/image'
import Footer from '../components/Footer'

export default function Home() {

  return (
    <div className={styles.container}>
      <Head>
        <title>Shibawars</title>
        <link rel="icon" href="/shibawars_logo_new.png" />
      </Head>

      <NavbarMain/>

      <main className={styles.main}>
        <div className={styles.section}>
          <h1 className={styles.title}>About</h1>
          <p className={styles.description}>
          The times of boredom have fallen upon our lands, and the breeders of Shiba Inu have started looking for a way to entertain themselves. 
          And so they took their beloved pets and put them into the arena, where they fought to entertain their owners. 
          Suddenly the activity became so popular, that breeders started to sell Shibas. And to have even more fun, they started giving out prizes to the best arena fighters.
          Shibawars is a collection of 14 types of Shiba Inu dogs. 
          While some are available for anyone to buy, some can only be found in a Lucky Shiba Pack with a little bit of luck and some are only awarded for OG Shiba Inu Token holders.
          </p>
        </div>

        <div className={styles.section}>
          <h1 className={styles.title}>Read our whitepaper</h1>
          <p className={styles.description}>
          You can read our whitepaper <a href="/shibawars_whitepaper.pdf" target="_blank">here</a>
          </p>
        </div>

        <div className={styles.section}>
          <h1 className={styles.title}>Team</h1>
          <div className={styles.grid}>
            <div className={styles.card}>
              <Image src="/kriko.jpg" alt="Kriko" width={3120} height={4160}/>
              <h2>Dominik Krížo</h2>
              <h3>a.k.a Kriko</h3>
              <p>Creator of Shibawars, programming, crypto, blockchain and decentralization fanatic.</p>
              <p>Worked on both back-end and front-end of Shibawars.</p>
            </div>
            <div className={styles.card}>
              <Image src="/kaya.jpg" alt="Kaya" width={3120} height={4160}/>
              <h2>Karolína Václavíková</h2>
              <h3>a.k.a Kaya</h3>
              <p>Passionate artist, who can spend days with her brushes.</p>
              <p>Worked on Shibawars NFTs and other graphics.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer/>

    </div>
  )
}
