import React from "react"
import Head from "next/head"
import Dog from "../components/Dog"
import { Button } from "@material-ui/core"
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
  // web3
  const { isAuthenticated, enableWeb3, isWeb3Enabled, web3, Moralis } = useMoralis();
  const [account, setAccount] = useState(undefined)
  const [chainId, setChainId] = useState(0)
  // game stats
  const [shibaTreats, setPowerTreats] = useState(0)
  // erc20
  const [userShibas, setUserShibas] = useState([])
  // ui
  const [fightResult, setFightResult] = useState(undefined)
  // airdrop
  const [noAirdrop, setNoAirdrop] = useState(0)
  const [claimedAlready, setClaimedAlready] = useState(0)
  // smart contracts
  const shibaWarsContract = new web3.eth.Contract(ShibaWarsABI.abi, process.env.NEXT_PUBLIC_SHIBAWARS_ADDRESS)
  const arenaContract = new web3.eth.Contract(ArenaABI.abi, process.env.NEXT_PUBLIC_ARENA_ADDRESS)
  const factoryContract = new web3.eth.Contract(FactoryABI.abi, process.env.NEXT_PUBLIC_FACTORY_ADDRESS)

  /**
   * 
   * WEB3 FUNCTIONS
   * 
   */

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

  /**
   * 
   * UI FUNCTIONS
   * 
   */

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
        <p>{reward > 0 ? "Attacker won " + formatNumber(reward) + " treats." : "Defender won"}</p>
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

  async function filterLeashes(tokens) {
    let userLeashes = []
    for (let tokenId of tokens) {
      let dogeData = await shibaWarsContract.methods.getTokenDetails(tokenId).call({ from: ethereum.selectedAddress })
      if (dogeData.tokenId >= 1 && dogeData.tokenId <= 4) {
        let isLeashUsed = await arenaContract.methods.isLeashUsed(tokenId).call({ from: ethereum.selectedAddress })
        if (!isLeashUsed) {
          userLeashes.push([tokenId, dogeData.tokenId])
        }
      }
    }
    return userLeashes
  }

  async function getUserTokens() {
    let shibaTreats_ = await shibaWarsContract.methods.getUserTreatTokens(account).call({ from: account });
    setPowerTreats(shibaTreats_)
    let userTokens = await shibaWarsContract.methods.getUserTokens(account).call({ from: account })
    const userShibas_ = []
    const leashes = await filterLeashes(userTokens)
    for (var shibaId of userTokens) {
      const dogContent = []
      let dog = await shibaWarsContract.methods.getTokenDetails(shibaId).call({ from: account })
      dogContent["dog"] = dog
      let tokenUri = await shibaWarsContract.methods.tokenURI(shibaId).call({ from: account })
      dogContent["tokenUri"] = tokenUri
      dogContent["treats"] = shibaTreats_
      dogContent["adventure"] = parseInt(await arenaContract.methods.getAdventureLevel(shibaId).call({ from: account })) + 1
      dogContent["leashes"] = leashes
      dogContent["leashId"] = await arenaContract.methods.getLeashId(shibaId).call({ from: account })
      dogContent["leashToken"] = await shibaWarsContract.methods.getTokenDetails(dogContent["leashId"]).call({ from: account })

      userShibas_.push(
        <React.Fragment key={dog["id"]}>
          <Dog arenaContract={arenaContract} dogData={dogContent} factoryContract={factoryContract} account={account}
            onOpen={() => { getUserTokens() }} shibaWarsContract={shibaWarsContract} showFight={(receipt) => { showFight(receipt, dog["id"]) }} />
        </React.Fragment>
      )
    }
    setUserShibas(userShibas_)
  }

  async function claimAirdrop() {
    let claimed = await factoryContract.methods.isAirdropClaimed().call({ from: account })
    if (claimed) {
      setClaimedAlready(1)
      return
    }
    let siblingsURI = "https://ipfs.io/ipfs/QmR3rjYaRsuyQLiUaZREDkoRVLBUyysRNVCMtsUWA8DbtL"
    let parentsURI = "https://ipfs.io/ipfs/QmPEasXWXjbTp5YfWvAvgh8gwQitRdXaA2ZyWz9yzRVZkh"
    let tryHashes = [];
    for (let i = 103; i <= 107; ++i) {
      let hash = await factoryContract.methods.getHash(account, i).call({ from: account });
      tryHashes[i] = hash;
    }
    let response = await fetch(siblingsURI);
    let siblings = await response.json();
    var finalHash;
    let airdropId = 0;
    for (let i = 103; i <= 107; ++i) {
      if (siblings[tryHashes[i]] !== undefined) {
        airdropId = i;
        finalHash = tryHashes[i];
        break;
      }
    }
    if (airdropId == 0) {
      setNoAirdrop(1)
      return
    }
    response = await fetch(parentsURI);
    let parents = await response.json();
    let proof = [];
    let i = 0;
    while (finalHash !== undefined) {
      if (i % 2 == 0) {
        finalHash = siblings[finalHash];
      } else {
        finalHash = parents[finalHash];
      }
      if (finalHash !== undefined) {
        proof.push(finalHash);
      }
      ++i;
    }
    factoryContract.methods.claimAirdrop(proof, tokenId).send({ from: account })
      .on("receipt", (() => {
        getUserTokens()
      }));
  }

  /**
   * 
   * RENDER FUNCTION
   * 
   */

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
        noAirdrop == 0 ? null : <AlertDialog title={"No airdrop"} text={"Your address is not eligible for an airdrop."} />
      }
      {
        claimedAlready == 0 ? null : <AlertDialog title={"Airdrop claimed"} text={"You have already claimed the airdrop."} />
      }
      {
        fightResult === undefined ? null : <AlertDialog title={"Fight result"} text={fightResult} onClose={() => { setFightResult(undefined) }} />
      }

      <NavbarApp />
      <main className={styles.main}>
        <div className={styles.section_app}>
          <h1 className={styles.title}>My Dogs</h1>
          <p className={styles.description}>You have {formatNumber(shibaTreats)} Shiba Treats.</p>
          <p className={styles.description}>Here are your dogs.</p>
          <p> {account !== undefined && chainId == 1337 ? <Button variant="contained" onClick={() => claimAirdrop()}>Claim Airdrop</Button> : null}</p>
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

function formatNumber(x) {
  let decimal = ""
  let integer = ""

  if (x.length > 18) {
    integer = x.substring(0, x.length - 18)
    decimal = x.substring(x.length - 18, x.length - 16)
  } else if (x.length > 16) {
    integer = "0"
    if (x.length == 17) {
      x = "0" + x
    }
    decimal = x.substring(0, x.length - 16)
  } else {
    return "0"
  }

  for (var i = integer.length - 3; i > 0; i -= 3) {
    var left = integer.substring(0, i)
    var right = integer.substring(i)
    integer = left + "." + right
  }
  return integer + (decimal == "00" ? "" : "," + decimal)
}