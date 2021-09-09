import Head from "next/head"
import Dog from "../components/Dog"
import { useMoralis } from "react-moralis"
import { useState, useEffect } from "react"
import styles from "../styles/Home.module.css"
import NavbarApp from "../components/NavbarApp"
import Footer from "../components/mainPage/Footer"
import ShibaWarsABI from "../public/ShibaWars.json"

export default function MyDogs() {
  const { isAuthenticated, enableWeb3, isWeb3Enabled, web3 } = useMoralis();
  const [account, setAccount] = useState(undefined)

  const shibaWarsContract = new web3.eth.Contract(ShibaWarsABI.abi, process.env.NEXT_PUBLIC_SHIBAWARS_ADDRESS)

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled) {
      enableWeb3()
    }
    if (isWeb3Enabled) {
      initAccount()
    } else {
      setAccount(undefined)
    }
  }, [isAuthenticated, isWeb3Enabled])

  useEffect(() => {
    if (account !== undefined) {
      getUserTokens()
    }
  }, [account])

  async function initAccount() {
    let accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])
  }

  async function getUserTokens() {
    let userTokens = await shibaWarsContract.methods.getUserTokens(account).call({from : account})
    console.log(userTokens)
  }

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
