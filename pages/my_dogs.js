import Header from '../components/Header'
import Footer from '../components/Footer'
import NavbarApp from '../components/NavbarApp'
import styles from '../styles/Home.module.css'
import Dog from '../components/Dog'
import { useMoralis } from 'react-moralis'

export default function MyDogs() {
  const { isAuthenticated } = useMoralis();

    return (
      <div className={styles.container}>
        <Header/>
        <NavbarApp/>
        <main className={styles.main}>
        
          <div className={styles.section_app}>
            <h1 className={styles.title}>My Dogs</h1>
            <p className={styles.description}>
              {isAuthenticated ? "Here are your dogs." : "Please log in with Metamask."}
            </p>
            <div className={styles.gridContainer}>
              <Dog dogUrl={"/kriko.jpg"}/>
              <Dog dogUrl={"/kriko.jpg"}/>
              <Dog dogUrl={"/kriko.jpg"}/>
              <Dog dogUrl={"/kriko.jpg"}/>
              <Dog dogUrl={"/kriko.jpg"}/>
              <Dog dogUrl={"/kriko.jpg"}/>
              <Dog dogUrl={"/kriko.jpg"}/>
              <Dog dogUrl={"/kriko.jpg"}/>
            </div>
          </div>
        
        </main>

        <Footer/>
      </div>
    )
}