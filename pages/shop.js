import Header from '../components/Header'
import { useMoralis } from "react-moralis"
import LeashABI from "../public/Leash.json"
import { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import ShibaSale from "../components/ShibaSale"
import styles from "../styles/Home.module.css"
import NavbarApp from "../components/NavbarApp"
import LeashSale from "../components/LeashSale"
import ShibaInuABI from "../public/ShibaInu.json"
import Footer from "../components/mainPage/Footer"
import AlertDialog from '../components/AlertDialog'
import ShibaWarsABI from "../build/contracts/ShibaWars.json"
import FactoryABI from "../build/contracts/ShibaWarsFactory.json"

export default function Shop() {
  const { isAuthenticated, enableWeb3, isWeb3Enabled, web3, Moralis } = useMoralis();
  const [account, setAccount] = useState(undefined)
  const [chainId, setChainId] = useState(0)
  const [shibaInu, setShibaInu] = useState("0")
  const [leash, setLeash] = useState("0")
  const [shibAllowed, setShibAllowed] = useState(false)
  const [leashAllowed, setLeashAllowed] = useState(false)
  const [boughtTokenId, setBoughtTokenId] = useState(0)
  const [imageUri, setImageUri] = useState("")
  const [name, setName] = useState("")

  const shibaInuContract = new web3.eth.Contract(ShibaInuABI.abi, process.env.NEXT_PUBLIC_SHIBA_INU_ADDRESS)
  const leashContract = new web3.eth.Contract(LeashABI.abi, process.env.NEXT_PUBLIC_LEASH_ADDRESS)
  const factoryContract = new web3.eth.Contract(FactoryABI.abi, process.env.NEXT_PUBLIC_FACTORY_ADDRESS)
  const shibaWarsContract = new web3.eth.Contract(ShibaWarsABI.abi, process.env.NEXT_PUBLIC_SHIBAWARS_ADDRESS)

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
      setShibaInu("0")
      setLeash("0")
    } else if (account !== undefined) {
      getUserErc20()
    }
  }, [account, chainId])

  async function initAccount() {
    let chain = await web3.eth.getChainId()
    setChainId(chain)
    let accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])
  }

  async function getUserErc20() {
    let shib_ = await shibaInuContract.methods.balanceOf(account).call({ from: account })
    if (shib_.length <= 18) {
      setShibaInu("0")
    } else {
      setShibaInu(thousandSeparator(shib_.substring(0, shib_.length - 18)))
    }

    let shibAllowance = await shibaInuContract.methods.allowance(account, process.env.NEXT_PUBLIC_FACTORY_ADDRESS).call({ from: account })
    if (shibAllowance == 0) {
      setShibAllowed(false)
    } else {
      setShibAllowed(true)
    }

    let leash_ = await leashContract.methods.balanceOf(account).call({ from: account })
    if (leash_.length <= 18) {
      if (leash_.length <= 16) {
        setLeash("0")
      } else {
        if (leash_.length == 18) {
          setLeash("0," + leash_.substring(0, 2))
        } else {
          setLeash("0,0" + leash_.substring(0, 1))
        }
      }
    } else {
      setLeash(thousandSeparator(leash_.substring(0, leash_.length - 18)))
    }

    let leashAllowance = await leashContract.methods.allowance(account, process.env.NEXT_PUBLIC_FACTORY_ADDRESS).call({ from: account })
    if (leashAllowance == 0) {
      setLeashAllowed(false)
    } else {
      setLeashAllowed(true)
    }
  }

  async function allowShib() {
    shibaInuContract.methods.approve(process.env.NEXT_PUBLIC_FACTORY_ADDRESS, "1000000000000000000000000000000000")
      .send({ from: account }).on("receipt", (() => {
        getUserErc20()
      }))
  }

  async function allowLeash() {
    leashContract.methods.approve(process.env.NEXT_PUBLIC_FACTORY_ADDRESS, "100000000000000000000000")
      .send({ from: account }).on("receipt", (() => {
        getUserErc20()
      }))
  }

  async function buyShiba(shibaId) {
    factoryContract.methods.buyShiba(shibaId).send({ from: account, gasLimit: 500000 })
      .on("receipt", (async (receipt) => {
        getUserErc20()
        let id = receipt.events["TokenBought"].returnValues[0]
        let uri = await shibaWarsContract.methods.tokenURI(id).call({ from: account })
        let response = await fetch(uri)
        let json = await response.json()
        setImageUri(json["image"])
        setName(json["name"])
        setBoughtTokenId(shibaId)
      }))
  }

  async function buyLeash(leashId) {
    factoryContract.methods.buyLeash(leashId).send({ from: account, gasLimit: 500000 })
      .on("receipt", (async (receipt) => {
        getUserErc20()
        let id = receipt.events["TokenBought"].returnValues[0]
        let uri = await shibaWarsContract.methods.tokenURI(id).call({ from: account })
        let response = await fetch(uri)
        let json = await response.json()
        setImageUri(json["image"])
        setName(json["name"])
        setBoughtTokenId(id)
      }))
  }

  function closeAlert() {
    setBoughtTokenId(0)
    setImageUri("")
    setName("")
  }

  return (
    <div className={styles.container}>
      <Header />

      {
        boughtTokenId == 0 ? null : <AlertDialog title={"Item Bought!"} text={name} imageUri={imageUri} onClose={() => closeAlert()} />
      }

      <NavbarApp />
      <main className={styles.main}>
        <div className={styles.section_app}>
          <h1 className={styles.title}>Shop</h1>
          <p className={styles.description}>Here you can buy a new Shiba Inu</p>
          <p className={styles.description}>
            Your $SHIB balance: {shibaInu}
            {shibAllowed ? null : <Button variant="contained" onClick={() => { allowShib() }}>Allow us to spend your $SHIB</Button>}
          </p>
          <p className={styles.description}>
            Your $LEASH balance: {leash}
            {leashAllowed ? null : <Button variant="contained" onClick={() => { allowLeash() }}>Allow us to spend your $LEASH</Button>}
          </p>
          <div className={styles.gridContainer}>
            <ShibaSale
              dogName={"Doge Killer"}
              dogPrice={200000000}
              dogUrl={"https://ipfs.io/ipfs/QmR3sbzQQNGCi6egS2Ba9mSb1EucgXo52jEJzJm14B4H3K?filename=token-109.png"}
              onClick={() => { buyShiba(108) }}
            />
            <ShibaSale
              dogName={"Aggresive Shiba Inu"}
              dogPrice={100000000}
              dogUrl={"https://ipfs.io/ipfs/QmZo2BVWNtCEy3qcRm31t5rLFJS7sGXuYp9TZFma7s9HYV?filename=token-110.png"}
              onClick={() => { buyShiba(109) }}
            />
            <ShibaSale
              dogName={"Bored Shiba Inu"}
              dogPrice={50000000}
              dogUrl={"https://ipfs.io/ipfs/QmZJcKUCbCkPBfMHLyuAxj8rqUUZFDw8ESeWzMoSQWahjt?filename=token-111.png"}
              onClick={() => { buyShiba(110) }}
            />
            <ShibaSale
              dogName={"Shiba Inu"}
              dogPrice={10000000}
              dogUrl={"https://ipfs.io/ipfs/QmZkGv9FiKtLFhtaoeux3kLoCbKgLPzVu6v2rRv8ZR5djv?filename=token-112.png"}
              onClick={() => { buyShiba(111) }}
            />
            <ShibaSale
              dogName={"Aggresive Shiba Pup"}
              dogPrice={5000000}
              dogUrl={"https://ipfs.io/ipfs/QmeTqPuKfeUEE2t3Km8Vn7XRJ5pSbm1ELX9jHAh1DinZQX?filename=token-113.png"}
              onClick={() => { buyShiba(112) }}
            />
            <ShibaSale
              dogName={"Shiba Pup"}
              dogPrice={1500000}
              dogUrl={"https://ipfs.io/ipfs/QmPkDhuQWa7nQaf32n6VmZDhDHbM7yxMVGrbgxXppcQBY9?filename=token-114.png"}
              onClick={() => { buyShiba(113) }}
            />
            <ShibaSale
              dogName={"Lucky Shiba Pack"}
              dogPrice={10000000}
              dogUrl={"https://ipfs.io/ipfs/QmQWq4kGwieHvxxNvNgDcW5ActvfLjxWaz8pvifAi3po92?filename=token-100.png"}
              onClick={() => { buyShiba(100) }}
            />
            <LeashSale
              leashName={"Diamond Leash"}
              leashPrice={10}
              leashUrl={"https://ipfs.io/ipfs/QmWSjmVuznZEhF22rtZfg5f5eNMkL2QhpX4ec7FsjcfmPX?filename=token-4.png"}
              onClick={() => { buyLeash(4) }}
            />
            <LeashSale
              leashName={"Golden Leash"}
              leashPrice={1}
              leashUrl={"https://ipfs.io/ipfs/Qmeixw393YfE5ynBWCtYrv65RXveDAXMYcmuseN55YR98h?filename=token-3.png"}
              onClick={() => { buyLeash(3) }}
            />
            <LeashSale
              leashName={"Silver Leash"}
              leashPrice={0.1}
              leashUrl={"https://ipfs.io/ipfs/QmcAvCTzq8f2rTjDXB3Xdk5kUbUCx4rv5Hqgzn95brgEBB?filename=token-2.png"}
              onClick={() => { buyLeash(2) }}
            />
            <LeashSale
              leashName={"Iron Leash"}
              leashPrice={0.01}
              leashUrl={"https://ipfs.io/ipfs/QmctEAYnAgkzKB3vxcgnWxnpZD4QaTz5LL9NhdHWim33kz?filename=token-1.png"}
              onClick={() => { buyLeash(1) }}
            />
            <ShibaSale
              dogName={"ShibaWars Supporter Badge"}
              dogPrice={500000}
              dogUrl={"https://ipfs.io/ipfs/QmPWkTwp4Zy8pBrRr37zTTVvv136kpAwd4sLqDQqGTxn7H?filename=token-101.png"}
              onClick={() => { buyShiba(101) }}
            />
          </div>
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