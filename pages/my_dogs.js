import React from "react"
import Head from "next/head"
import Dog from "../components/Dog"
import { useMoralis } from "react-moralis"
import { useState, useEffect } from "react"
import styles from "../styles/Home.module.css"
import NavbarApp from "../components/NavbarApp"
import Footer from "../components/mainPage/Footer"
import ShibaWarsABI from "../public/ShibaWars.json"
import ArenaABI from "../public/ShibaWarsArena.json"

export default function MyDogs() {
  const { isAuthenticated, enableWeb3, isWeb3Enabled, web3, Moralis } = useMoralis();
  const [account, setAccount] = useState(undefined)
  const [shibaTreats, setPowerTreats] = useState(0)
  const [userShibas, setUserShibas] = useState([])

  const shibaWarsContract = new web3.eth.Contract(ShibaWarsABI.abi, process.env.NEXT_PUBLIC_SHIBAWARS_ADDRESS)
  const arenaContract = new web3.eth.Contract(ArenaABI.abi, process.env.NEXT_PUBLIC_ARENA_ADDRESS)

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled) {
      enableWeb3()
    }
    if (isWeb3Enabled) {
      initAccount()
      Moralis.Web3.onAccountsChanged(function(accounts){
        setAccount(accounts[0])
      })
    } else {
      setAccount(undefined)
    }
  }, [isAuthenticated, isWeb3Enabled])

  useEffect(() => {
    if (account !== undefined) {
      getUserTokens()
      getUserPowerTreats()
    }
  }, [account])

  async function initAccount() {
    let accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])
  }

  async function getUserPowerTreats() {
    let shibaTreats_ = await shibaWarsContract.methods.getUserTreatTokens(account).call({from: account});
    setPowerTreats(shibaTreats_)
  }

  async function getUserTokens() {
    let userTokens = await shibaWarsContract.methods.getUserTokens(account).call({from : account})
    const userShibas_ = []
    for (var shibaId of userTokens) {
      const dogContent = []
      let dog = await shibaWarsContract.methods.getTokenDetails(shibaId).call({from : account})
      dogContent["dog"] = dog
      let tokenUri = await shibaWarsContract.methods.tokenURI(shibaId).call({from : account})
      dogContent["tokenUri"] = tokenUri
      // TODO
      dogContent["treats"] = shibaTreats
      dogContent["adventure"] = 11
      dogContent["leashes"] = []
      dogContent["leashId"] = 0

      userShibas_.push( <React.Fragment key={dog["id"]}><Dog dogData={dogContent} /></React.Fragment>)
    }
    setUserShibas(userShibas_)
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
          <p className={styles.description}>You have {shibaTreats} Shiba Treats.</p>
          <p className={styles.description}>Here are your dogs.</p>
            {
              isAuthenticated && isWeb3Enabled ? 
              <div className={styles.gridContainer}>{userShibas}</div>
              : null
            }
        </div>
      </main>

      <Footer />
    </div>
  )
}
