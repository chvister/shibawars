import { Fragment } from 'react'
import Header from '../components/Header'
import { useState, useEffect } from "react"
import { useMoralis } from 'react-moralis'
import TableRow from '../components/TableRow'
import styles from '../styles/Home.module.css'
import NavbarApp from '../components/NavbarApp'
import Footer from '../components/mainPage/Footer'
import AlertDialog from "../components/AlertDialog"
import { BigNumber } from '@ethersproject/bignumber'
import ShibaWarsABI from '../build/contracts/ShibaWars.json'
import FactoryABI from '../build/contracts/ShibaWarsFactory.json'

export default function Arena() {
  // web3
  const { isAuthenticated, enableWeb3, isWeb3Enabled, web3, Moralis } = useMoralis();
  const [account, setAccount] = useState(undefined)
  const [chainId, setChainId] = useState(0)
  // arena
  const [prizePoolShib, setPrizePoolShib] = useState("0")
  const [prizePoolLeash, setPrizePoolLeash] = useState("0")
  const [prizePoolFloki, setPrizePoolFloki] = useState("0")
  const [winners, setWinners] = useState([])
  // fights reward
  const [rewardShib, setRewardShib] = useState("0")
  const [rewardLeash, setRewardLeash] = useState("0")
  const [rewardFloki, setRewardFloki] = useState("0")
  // smart contracts
  const factoryContract = new web3.eth.Contract(FactoryABI.abi, process.env.NEXT_PUBLIC_FACTORY_ADDRESS)
  const shibaWarsContract = new web3.eth.Contract(ShibaWarsABI.abi, process.env.NEXT_PUBLIC_SHIBAWARS_ADDRESS)

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
      setPrizePoolShib("0")
      setPrizePoolLeash("0")
      setPrizePoolFloki("0")
      setRewardShib("0")
      setRewardLeash("0")
      setRewardFloki("0")
    } else if (account !== undefined) {
      getPrizePool()
    }
  }, [account, chainId])

  async function initAccount() {
    let chain = await web3.eth.getChainId()
    setChainId(chain)
    let accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])
  }

  // prizepool info
  async function getPrizePool() {
    let reward = await factoryContract.methods.claimablePrize(account).call({ from: account })

    let shib_ = await factoryContract.methods.getPrizePool().call({ from: account })
    setPrizePoolShib(formatNumber(shib_))

    let shibReward_ = reward["_shib"]
    setRewardShib(formatNumber(shibReward_))

    let floki_ = await factoryContract.methods.getPrizePoolFloki().call({ from: account })
    setPrizePoolFloki(formatNumber(floki_))

    let flokiReward = reward["_floki"]
    setRewardFloki(formatNumber(flokiReward))

    let leash_ = await factoryContract.methods.getPrizePoolLeash().call({ from: account })
    setPrizePoolLeash(formatNumber(leash_))

    let leashReward = reward["_leash"]
    setRewardLeash(formatNumber(leashReward))

    let winnersReturn = await shibaWarsContract.methods.getWinners().call({ from: account })

    let winnerIds = winnersReturn[0].map((i) => { return i })
    let scores = winnersReturn[1].map((i) => { return i })

    for (let i = 0; i < 9; ++i) {
      for (let j = i + 1; j < 10; ++j) {
        if (scores[i] < scores[j]) {
          let tmp = winnerIds[j];
          winnerIds[j] = winnerIds[i];
          winnerIds[i] = tmp;
          tmp = scores[j];
          scores[j] = scores[i];
          scores[i] = tmp;
        }
      }
    }

    let shares = [26, 20, 15, 12, 9, 7, 4, 3, 2, 1]
    let winners_ = []
    for (let i = 0; i < 10; ++i) {
      let object = []
      object["rank"] = i + 1
      object["dogId"] = winnerIds[i]
      object["address"] = await shibaWarsContract.methods.ownerOf(winnerIds[i]).call({ from: account })
      object["score"] = scores[i]
      let shib = BigNumber.from(shib_).mul(BigNumber.from(shares[i])).div(200)
      let leash = BigNumber.from(leash_).mul(BigNumber.from(shares[i])).div(200)
      let floki = BigNumber.from(floki_).mul(BigNumber.from(shares[i])).div(200)
      object["shib"] = formatNumber(shib.toString())
      object["leash"] = formatNumber(leash.toString())
      object["floki"] = formatNumber(floki.toString())
      winners_[i] = object
    }
    setWinners(winners_)

  }

  // # - dog id - owner address - arena score
  return (
    <div className={styles.container}>
      <Header />
      <NavbarApp />
      {
        chainId == 1337 ? null : <AlertDialog title={"Wrong network"} text={"Please select ganache network."} />
      }
      <main className={styles.main}>
        <div className={styles.section_app}>
          <h1 className={styles.title}>Arena</h1>
          <p className={styles.description}>
            Current prizepool: {prizePoolShib} $SHIB + {prizePoolLeash} $LEASH + {prizePoolFloki} $FLOKI
          </p>
          <p className={styles.description}>
            You will be able to claim {rewardShib} $SHIB + {rewardLeash} $LEASH + {rewardFloki} $FLOKI
            for your won fights after the season ends. This can change with total number of fights and your number of arena wins.
          </p>
          <div className={styles.table}>
            <TableRow rank={"#"} dogId={"Dog Id"} address={"Owner Address"} score={"Score"} share={"Share"} />
            {
              winners.map((winner) => {
                return <Fragment key={winner["rank"]}>
                  <TableRow rank={winner["rank"]} dogId={winner["dogId"]} address={winner["address"]}
                    score={winner["score"]} shib={winner["shib"]} leash={winner["leash"]} floki={winner["floki"]} />
                </Fragment>
              })
            }
          </div>
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