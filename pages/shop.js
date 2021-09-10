import Header from '../components/Header'
import { useMoralis } from "react-moralis"
import LeashABI from "../public/Leash.json"
import { useState, useEffect } from 'react'
import ShibaSale from "../components/DogShop"
import styles from "../styles/Home.module.css"
import NavbarApp from "../components/NavbarApp"
import LeashSale from "../components/LeashShop"
import ShibaInuABI from "../public/ShibaInu.json"
import Footer from "../components/mainPage/Footer"

export default function Shop() {
  const { isAuthenticated, enableWeb3, isWeb3Enabled, web3, Moralis } = useMoralis();
  const [account, setAccount] = useState(undefined)
  const [chainId, setChainId] = useState(0)
  const [shibaInu, setShibaInu] = useState("0")
  const [leash, setLeash] = useState("0")

  const shibaInuContract = new web3.eth.Contract(ShibaInuABI.abi, process.env.NEXT_PUBLIC_SHIBA_INU_ADDRESS)
  const leashContract = new web3.eth.Contract(LeashABI.abi, process.env.NEXT_PUBLIC_LEASH_ADDRESS)

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
    let shib_ = await shibaInuContract.methods.balanceOf(account).call({ from: account });
    if (shib_.length <= 18) {
      setShibaInu("0")
    } else {
      setShibaInu(thousandSeparator(shib_.substring(0, shib_.length - 18)))
    }
    let leash_ = await leashContract.methods.balanceOf(account).call({ from: account });
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
  }

  return (
    <div className={styles.container}>
      <Header />

      <NavbarApp />
      <main className={styles.main}>
        <div className={styles.section_app}>
          <h1 className={styles.title}>Shop</h1>
          <p className={styles.description}>Here you can buy a new Shiba Inu</p>
          <p className={styles.description}>Your $SHIB balance: {shibaInu}</p>
          <p className={styles.description}>Your $LEASH balance: {leash}</p>
          <div className={styles.gridContainer}>
            <ShibaSale
              dogName={"Doge Killer"}
              dogPrice={200000000}
              dogUrl={"https://ipfs.io/ipfs/QmR3sbzQQNGCi6egS2Ba9mSb1EucgXo52jEJzJm14B4H3K?filename=token-109.png"}
            />
            <ShibaSale
              dogName={"Aggresive Shiba Inu"}
              dogPrice={100000000}
              dogUrl={"https://ipfs.io/ipfs/QmZo2BVWNtCEy3qcRm31t5rLFJS7sGXuYp9TZFma7s9HYV?filename=token-110.png"}
            />
            <ShibaSale
              dogName={"Bored Shiba Inu"}
              dogPrice={50000000}
              dogUrl={"https://ipfs.io/ipfs/QmZJcKUCbCkPBfMHLyuAxj8rqUUZFDw8ESeWzMoSQWahjt?filename=token-111.png"}
            />
            <ShibaSale
              dogName={"Shiba Inu"}
              dogPrice={10000000}
              dogUrl={"https://ipfs.io/ipfs/QmZkGv9FiKtLFhtaoeux3kLoCbKgLPzVu6v2rRv8ZR5djv?filename=token-112.png"}
            />
            <ShibaSale
              dogName={"Aggresive Shiba Pup"}
              dogPrice={5000000}
              dogUrl={"https://ipfs.io/ipfs/QmeTqPuKfeUEE2t3Km8Vn7XRJ5pSbm1ELX9jHAh1DinZQX?filename=token-113.png"}
            />
            <ShibaSale
              dogName={"Shiba Pup"}
              dogPrice={1500000}
              dogUrl={"https://ipfs.io/ipfs/QmPkDhuQWa7nQaf32n6VmZDhDHbM7yxMVGrbgxXppcQBY9?filename=token-114.png"}
            />
            <ShibaSale
              dogName={"Lucky Shiba Pack"}
              dogPrice={10000000}
              dogUrl={"https://ipfs.io/ipfs/QmQWq4kGwieHvxxNvNgDcW5ActvfLjxWaz8pvifAi3po92?filename=token-100.png"}
            />
            <LeashSale
              leashName={"Diamond Leash"}
              leashPrice={10}
              leashUrl={"https://ipfs.io/ipfs/QmWSjmVuznZEhF22rtZfg5f5eNMkL2QhpX4ec7FsjcfmPX?filename=token-4.png"}
            />
            <LeashSale
              leashName={"Golden Leash"}
              leashPrice={1}
              leashUrl={"https://ipfs.io/ipfs/Qmeixw393YfE5ynBWCtYrv65RXveDAXMYcmuseN55YR98h?filename=token-3.png"}
            />
            <LeashSale
              leashName={"Silver Leash"}
              leashPrice={0.1}
              leashUrl={"https://ipfs.io/ipfs/QmcAvCTzq8f2rTjDXB3Xdk5kUbUCx4rv5Hqgzn95brgEBB?filename=token-2.png"}
            />
            <LeashSale
              leashName={"Iron Leash"}
              leashPrice={0.01}
              leashUrl={"https://ipfs.io/ipfs/QmctEAYnAgkzKB3vxcgnWxnpZD4QaTz5LL9NhdHWim33kz?filename=token-1.png"}
            />
            <ShibaSale
              dogName={"ShibaWars Supporter Badge"}
              dogPrice={500000}
              dogUrl={"https://ipfs.io/ipfs/QmQWq4kGwieHvxxNvNgDcW5ActvfLjxWaz8pvifAi3po92?filename=token-101.png"}
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