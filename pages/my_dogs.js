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
  const [fightResult, setFightResult] = useState(undefined)

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
    }
  }, [account, chainId])

  async function initAccount() {
    let chain = await web3.eth.getChainId()
    setChainId(chain)
    let accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])
  }

  async function showFight(receipt, shibaId) {
    let event = receipt.events["ArenaFight"]
    let adventure = receipt.events["AdventureFight"]
    if (event === undefined && adventure === undefined) {
      setFightResult("Your Shiba is now waiting for a fight in arena")
    } else if (adventure !== undefined) {
      let values = adventure["returnValues"]
      let attackerId = values["shibaId"]
      let attackerDamage = values["shibaStrength"]
      let defenderId = values["enemyId"]
      let defenderDamage = values["enemyStrength"]
      let reward = values["reward"]
      setFightResult(<p>
        <p>Fight ({attackerId}, Attacker) vs ({defenderId == 0 ? "Wild Shiba" : defenderId == 1 ? "Wolf" : "Bear"}, Defender)</p>
        <p>Attacker did {attackerDamage / 100} damage and defender did {defenderDamage / 100} damage</p>
        {attackerDamage <= defenderDamage && reward > 0 ? <p>Defender fainted</p> : null}
        {defenderDamage <= attackerDamage && reward == 0 ? <p>Attacker fainted</p> : null}
        <p>{reward > 0 ? "Attacker won " + thousandSeparator(reward) + " treats." : "Defender won"}</p>
      </p>)
    } else {
      let values = event["returnValues"]
      let attackerId = values["attackerId"]
      let attackerDamage = values["attackerDamage"]
      let defenderId = values["defenderId"]
      let defenderDamage = values["defenderDamage"]
      let result = values["outcome"]
      setFightResult(<p>
        <p>Fight ({attackerId}, Attacker) vs ({defenderId}, Defender)</p>
        <p>Your Shiba was the {shibaId == attackerId ? "attacker" : "defender"}</p>
        <p>Attacker did {attackerDamage / 100} damage and defender did {defenderDamage / 100} damage</p>
        {attackerDamage <= defenderDamage && result == 1 ? <p>Defender fainted</p> : null}
        {defenderDamage <= attackerDamage && result == 2 ? <p>Attacker fainted</p> : null}
        <p>{result == 1 ? "Attacker won" : result == 2 ? "Defender won" : "It was a draw"}</p>
      </p>)
    }
  }

  async function getUserTokens() {
    let shibaTreats_ = await shibaWarsContract.methods.getUserTreatTokens(account).call({ from: account });
    setPowerTreats(shibaTreats_)
    let userTokens = await shibaWarsContract.methods.getUserTokens(account).call({ from: account })
    const userShibas_ = []
    for (var shibaId of userTokens) {
      const dogContent = []
      let dog = await shibaWarsContract.methods.getTokenDetails(shibaId).call({ from: account })
      dogContent["dog"] = dog
      let tokenUri = await shibaWarsContract.methods.tokenURI(shibaId).call({ from: account })
      dogContent["tokenUri"] = tokenUri
      dogContent["treats"] = shibaTreats_
      dogContent["adventure"] = parseInt(await arenaContract.methods.getAdventureLevel(shibaId).call({ from: account })) + 1
      // TODO
      dogContent["leashes"] = []
      dogContent["leashId"] = 0

      userShibas_.push(
        <React.Fragment key={dog["id"]}>
          <Dog arenaContract={arenaContract} dogData={dogContent} factoryContract={factoryContract} account={account}
            onOpen={() => { getUserTokens() }} shibaWarsContract={shibaWarsContract} showFight={(receipt) => { showFight(receipt, dog["id"]) }} />
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
      {
        fightResult === undefined ? null : <AlertDialog title={"Fight result"} text={fightResult} onClose={() => { setFightResult(undefined) }} />
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