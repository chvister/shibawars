import React from "react"
import Head from "next/head"
import Dog from "../components/Dog"
import { useMoralis } from "react-moralis"
import { useState, useEffect } from "react"
import styles from "../styles/Home.module.css"
import NavbarApp from "../components/NavbarApp"
import Footer from "../components/mainPage/Footer"
import AlertDialog from "../components/AlertDialog"
import ShibaWarsABI from "../build/contracts/ShibaWars.json"
import ArenaABI from "../build/contracts/ShibaWarsArena.json"
import FactoryABI from "../build/contracts/ShibaWarsFactory.json"

export default function MyDogs() {
  const { isAuthenticated, enableWeb3, isWeb3Enabled, web3, Moralis } = useMoralis();
  const [account, setAccount] = useState(undefined)
  const [shibaTreats, setPowerTreats] = useState(0)
  const [chainId, setChainId] = useState(0)
  const [userShibas, setUserShibas] = useState([])

  const shibaWarsContract = new web3.eth.Contract(ShibaWarsABI.abi, process.env.NEXT_PUBLIC_SHIBAWARS_ADDRESS)
  const arenaContract = new web3.eth.Contract(ArenaABI.abi, process.env.NEXT_PUBLIC_ARENA_ADDRESS)
  const factoryContract = new web3.eth.Contract(FactoryABI.abi, process.env.NEXT_PUBLIC_FACTORY_ADDRESS)

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled) {
      enableWeb3()
    }
    if (isWeb3Enabled) {
      initAccount()
      Moralis.Web3.onAccountsChanged(function (accounts) {
        setAccount(accounts[0])
      })
      Moralis.Web3.onChainChanged(function (chains) {
        initAccount()
      })
    } else {
      setAccount(undefined)
    }
  }, [isAuthenticated, isWeb3Enabled])

  useEffect(() => {
    if (chainId != 1337) {
      setUserShibas([])
      setPowerTreats(0)
    } else if (account !== undefined) {
      getUserTokens()
      getUserPowerTreats()
    }
  }, [account, chainId])

  async function initAccount() {
    let chain = await web3.eth.getChainId()
    setChainId(chain)
    let accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])
  }

  async function getUserPowerTreats() {
    let shibaTreats_ = await shibaWarsContract.methods.getUserTreatTokens(account).call({ from: account });
    setPowerTreats(shibaTreats_)
  }

  async function getUserTokens() {
    let userTokens = await shibaWarsContract.methods.getUserTokens(account).call({ from: account })
    const userShibas_ = []
    for (var shibaId of userTokens) {
      const dogContent = []
      let dog = await shibaWarsContract.methods.getTokenDetails(shibaId).call({ from: account })
      dogContent["dog"] = dog
      let tokenUri = await shibaWarsContract.methods.tokenURI(shibaId).call({ from: account })
      dogContent["tokenUri"] = tokenUri
      dogContent["treats"] = shibaTreats
      // TODO
      dogContent["adventure"] = 11
      dogContent["leashes"] = []
      dogContent["leashId"] = 0

      userShibas_.push(
        <React.Fragment key={dog["id"]}>
          <Dog dogData={dogContent} factoryContract={factoryContract} account={account} onOpen={() => { getUserTokens() }} />
        </React.Fragment>
      )
    }
    setUserShibas(userShibas_)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Shibawars</title>
        <link rel="icon" href="/shibawars_logo_new.png" />
      </Head>

      {
        chainId == 1337 ? null : <AlertDialog title={"Wrong network"} text={"Please select ganache network."} />
      }

      <NavbarApp />
      <main className={styles.main}>
        <div className={styles.section_app}>
          <h1 className={styles.title}>My Dogs</h1>
          <p className={styles.description}>You have {thousandSeparator(shibaTreats)} Shiba Treats.</p>
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

function thousandSeparator(x) {
  for (var i = x.toString().length - 3; i > 0; i -= 3) {
    var left = x.toString().substring(0, i)
    var right = x.toString().substring(i)
    x = left + "." + right
  }
  return x
}