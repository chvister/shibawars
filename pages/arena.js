import Header from '../components/Header'
import { useState, useEffect } from "react"
import { useMoralis } from 'react-moralis'
import TableRow from '../components/TableRow'
import styles from '../styles/Home.module.css'
import NavbarApp from '../components/NavbarApp'
import Footer from '../components/mainPage/Footer'
import AlertDialog from "../components/AlertDialog"
import FactoryABI from '../build/contracts/ShibaWarsFactory.json'

export default function Arena() {
  // web3
  const { isAuthenticated, enableWeb3, isWeb3Enabled, web3, Moralis } = useMoralis();
  const [account, setAccount] = useState(undefined)
  const [chainId, setChainId] = useState(0)
  // prizepool
  const [prizePoolShib, setPrizePoolShib] = useState("0")
  const [prizePoolLeash, setPrizePoolLeash] = useState("0")
  const [prizePoolFloki, setPrizePoolFloki] = useState("0")
  // fights reward
  const [rewardShib, setRewardShib] = useState("0")
  const [rewardLeash, setRewardLeash] = useState("0")
  const [rewardFloki, setRewardFloki] = useState("0")
  // smart contracts
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

    shib_ = reward["_shib"]
    setRewardShib(formatNumber(shib_))

    let floki_ = await factoryContract.methods.getPrizePoolFloki().call({ from: account })
    setPrizePoolFloki(formatNumber(floki_))

    floki_ = reward["_floki"]
    setRewardFloki(formatNumber(floki_))

    let leash_ = await factoryContract.methods.getPrizePoolLeash().call({ from: account })
    setPrizePoolLeash(formatNumber(leash_))

    leash_ = reward["_leash"]
    setRewardLeash(formatNumber(leash_))

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
            <TableRow rank={1} dogId={1} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={1000} share={26} />
            <TableRow rank={2} dogId={2} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={900} share={20} />
            <TableRow rank={3} dogId={3} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={810} share={15} />
            <TableRow rank={4} dogId={4} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={700} share={12} />
            <TableRow rank={5} dogId={5} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={600} share={9} />
            <TableRow rank={6} dogId={6} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={500} share={7} />
            <TableRow rank={7} dogId={7} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={400} share={4} />
            <TableRow rank={8} dogId={8} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={300} share={3} />
            <TableRow rank={9} dogId={9} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={200} share={2} />
            <TableRow rank={10} dogId={10} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={100} share={1} />
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
  return integer + "," + decimal
}