import Header from "../components/Header"
import { useMoralis } from "react-moralis"
import { useState, useEffect } from "react"
import Button from "@material-ui/core/Button"
import { TextField } from "@material-ui/core"
import ShibaSale from "../components/ShibaSale"
import styles from "../styles/Home.module.css"
import NavbarApp from "../components/NavbarApp"
import LeashSale from "../components/LeashSale"
import Footer from "../components/mainPage/Footer"
import AlertDialog from "../components/AlertDialog"
import LeashABI from "../build/contracts/Leash.json"
import FlokiInuABI from "../build/contracts/FlokiInu.json"
import ShibaInuABI from "../build/contracts/ShibaInu.json"
import ShibaWarsABI from "../build/contracts/ShibaWars.json"
import FactoryABI from "../build/contracts/ShibaWarsFactory.json"
import { Card, Container, Row, Col } from "react-bootstrap"
import { ShopItems } from "./shopItems"
import "bootstrap/dist/css/bootstrap.min.css"

export default function Shop() {
  // web3
  const { isAuthenticated, enableWeb3, isWeb3Enabled, web3, Moralis } =
    useMoralis()
  const [account, setAccount] = useState(undefined)
  const [chainId, setChainId] = useState(0)
  // erc-20
  const [shibaInu, setShibaInu] = useState("0")
  const [shibAllowed, setShibAllowed] = useState(false)
  const [leash, setLeash] = useState("0")
  const [leashAllowed, setLeashAllowed] = useState(false)
  const [floki, setFloki] = useState("0")
  const [flokiAllowed, setFlokiAllowed] = useState(false)
  // game stats
  const [trainerTokens, setTrainerTokens] = useState("0")
  const [shibaTreats, setShibaTreats] = useState(0)
  // purchase info
  const [boughtTokenId, setBoughtTokenId] = useState(0)
  const [imageUri, setImageUri] = useState("")
  const [name, setName] = useState("")
  const [buyTreatsCount, setBuyTreatsCount] = useState(1500000)
  const [notEnoughTreats, setNotEnoughTreats] = useState(false)
  // smart contracts
  const shibaInuContract = new web3.eth.Contract(
    ShibaInuABI.abi,
    process.env.NEXT_PUBLIC_SHIBA_INU_ADDRESS
  )
  const leashContract = new web3.eth.Contract(
    LeashABI.abi,
    process.env.NEXT_PUBLIC_LEASH_ADDRESS
  )
  const flokiInuContract = new web3.eth.Contract(
    FlokiInuABI.abi,
    process.env.NEXT_PUBLIC_FLOKI_ADDRESS
  )
  const factoryContract = new web3.eth.Contract(
    FactoryABI.abi,
    process.env.NEXT_PUBLIC_FACTORY_ADDRESS
  )
  const shibaWarsContract = new web3.eth.Contract(
    ShibaWarsABI.abi,
    process.env.NEXT_PUBLIC_SHIBAWARS_ADDRESS
  )

  // init web3
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

  // web3 attribute changed
  useEffect(() => {
    if (chainId != 1337) {
      setShibaInu("0")
      setLeash("0")
    } else if (account !== undefined) {
      getUserErc20()
    }
  }, [account, chainId])

  // web3 attribute changed
  async function initAccount() {
    let chain = await web3.eth.getChainId()
    setChainId(chain)
    let accounts = await web3.eth.getAccounts()
    setAccount(accounts[0])
  }

  // erc20 info
  async function getUserErc20() {
    let shib_ = await shibaInuContract.methods
      .balanceOf(account)
      .call({ from: account })
    setShibaInu(formatNumber(shib_))

    let shibAllowance = await shibaInuContract.methods
      .allowance(account, process.env.NEXT_PUBLIC_FACTORY_ADDRESS)
      .call({ from: account })
    if (shibAllowance == 0) {
      setShibAllowed(false)
    } else {
      setShibAllowed(true)
    }

    let floki_ = await flokiInuContract.methods
      .balanceOf(account)
      .call({ from: account })
    setFloki(formatNumber(floki_))

    let flokiAllowance = await flokiInuContract.methods
      .allowance(account, process.env.NEXT_PUBLIC_FACTORY_ADDRESS)
      .call({ from: account })
    if (flokiAllowance == 0) {
      setFlokiAllowed(false)
    } else {
      setFlokiAllowed(true)
    }

    let leash_ = await leashContract.methods
      .balanceOf(account)
      .call({ from: account })
    setLeash(formatNumber(leash_))

    let leashAllowance = await leashContract.methods
      .allowance(account, process.env.NEXT_PUBLIC_FACTORY_ADDRESS)
      .call({ from: account })
    if (leashAllowance == 0) {
      setLeashAllowed(false)
    } else {
      setLeashAllowed(true)
    }

    let trainerTokens = await factoryContract.methods
      .userTrainerTokens(account)
      .call({ from: account })
    setTrainerTokens(trainerTokens)

    let shibaTreats = await shibaWarsContract.methods
      .getUserTreatTokens(account)
      .call({ from: account })
    setShibaTreats(thousandSeparator(shibaTreats))
  }

  /**
   *
   * TOKENS FUNCTIONS
   *
   */
  async function allowShib() {
    shibaInuContract.methods
      .approve(
        process.env.NEXT_PUBLIC_FACTORY_ADDRESS,
        "1000000000000000000000000000000000"
      )
      .send({ from: account })
      .on("receipt", () => {
        getUserErc20()
      })
  }

  async function allowLeash() {
    leashContract.methods
      .approve(
        process.env.NEXT_PUBLIC_FACTORY_ADDRESS,
        "100000000000000000000000"
      )
      .send({ from: account })
      .on("receipt", () => {
        getUserErc20()
      })
  }

  async function allowFloki() {
    flokiInuContract.methods
      .approve(
        process.env.NEXT_PUBLIC_FACTORY_ADDRESS,
        "10000000000000000000000000000000"
      )
      .send({ from: account })
      .on("receipt", () => {
        getUserErc20()
      })
  }

  /**
   *
   * SHOP FUNCTIONS
   *
   */

  async function buyShiba(shibaId) {
    factoryContract.methods
      .buyShiba(shibaId)
      .send({ from: account, gasLimit: 500000 })
      .on("receipt", async (receipt) => {
        processPurchase(receipt)
      })
  }

  async function buyShibaWithFloki(shibaId) {
    factoryContract.methods
      .buyShibaWithFloki(shibaId)
      .send({ from: account, gasLimit: 500000 })
      .on("receipt", async (receipt) => {
        processPurchase(receipt)
      })
  }

  async function buyShibaTT(shibaId) {
    factoryContract.methods
      .buyShibaWithTrainerTokens(shibaId)
      .send({ from: account, gasLimit: 500000 })
      .on("receipt", async (receipt) => {
        processPurchase(receipt)
      })
  }

  async function buyLeash(leashId) {
    factoryContract.methods
      .buyLeash(leashId)
      .send({ from: account, gasLimit: 500000 })
      .on("receipt", async (receipt) => {
        processPurchase(receipt)
      })
  }

  async function buyShibaTreats() {
    if (buyTreatsCount < 1) {
      setNotEnoughTreats(true)
      return
    }
    factoryContract.methods
      .buyTreats(buyTreatsCount)
      .send({ from: account, gasLimit: 150000 })
      .on("receipt", async () => {
        getUserErc20()
      })
  }

  /**
   *
   * UI FUNCTIONS
   *
   */

  async function processPurchase(receipt) {
    getUserErc20()
    let id = receipt.events["TokenBought"].returnValues[0]
    let uri = await shibaWarsContract.methods
      .tokenURI(id)
      .call({ from: account })
    let response = await fetch(uri)
    let json = await response.json()
    setImageUri(json["image"])
    setName(json["name"])
    setBoughtTokenId(id)
  }

  function closeAlert() {
    setBoughtTokenId(0)
    setImageUri("")
    setName("")
    setNotEnoughTreats(false)
  }

  function handleChange(event) {
    setBuyTreatsCount(event.target.value)
  }

  /**
   *
   * RENDER FUNCTION
   *
   */

  return (
    <div className={styles.container}>
      <Header />

      {boughtTokenId == 0 ? null : (
        <AlertDialog
          title={"Item Bought!"}
          text={name}
          imageUri={imageUri}
          onClose={() => closeAlert()}
        />
      )}
      {notEnoughTreats ? (
        <AlertDialog
          title={"Error!"}
          text={"Number of Shiba Treats must be at least 1!"}
          onClose={() => closeAlert()}
        />
      ) : null}

      <NavbarApp />
      <Container className="col-xs-10 col-sm-10 col-md-10 col-lg-7 col-xl-7">
        <div style={{ marginTop: "5rem" }}>
          <Card.Img
            variant="top"
            src="SHOP.png"
            className={styles.titlePhotoTeam}
            data-aos="fade-up"
          />

          <Card.Body className={styles.description} data-aos="fade-up">
            <p className={styles.description}>
              Here you can buy a new Shiba Inu
            </p>
            <p className={styles.description}>
              Your trainer tokens: {trainerTokens}
            </p>
            <p className={styles.description}>
              Your Shiba Treats: {shibaTreats}
            </p>
            <p className={styles.description}>
              Your $SHIB balance: {shibaInu}
              {shibAllowed ? null : (
                <button
                  className={styles.navbarButton}
                  onClick={() => {
                    allowShib()
                  }}
                >
                  Allow us to spend your $SHIB
                </button>
              )}
            </p>
            <p className={styles.description}>
              Your $FLOKI balance: {floki}
              {flokiAllowed ? null : (
                <button
                  className={styles.navbarButton}
                  onClick={() => {
                    allowFloki()
                  }}
                >
                  Allow us to spend your $FLOKI
                </button>
              )}
            </p>
            <p className={styles.description}>
              Your $LEASH balance: {leash}
              {leashAllowed ? null : (
                <button
                  className={styles.navbarButton}
                  onClick={() => {
                    allowLeash()
                  }}
                >
                  Allow us to spend your $LEASH
                </button>
              )}
            </p>
            <p>
              <TextField
                id="treats-count"
                variant="outlined"
                defaultValue={buyTreatsCount}
                type="number"
                onChange={handleChange}
              />
              <button
                className={styles.navbarButton}
                onClick={() => {
                  buyShibaTreats()
                }}
              >
                Buy {thousandSeparator(buyTreatsCount)} Shiba Treats for{" "}
                {thousandSeparator(buyTreatsCount / 10)} $SHIB
              </button>
            </p>
            <Container>
              <Row>
                {ShopItems.map((data, index) => (
                  <Col>
                    <Card className={styles.box} data-aos="fade-up">
                      {data.payment === "ShibaSale" ? (
                        <ShibaSale
                          key={index}
                          dogName={data.dogName}
                          dogPrice={data.dogPrice}
                          dogPriceFloki={data.dogPriceFloki}
                          dogPriceTT={data.dogPriceTT}
                          dogUrl={data.dogUrl}
                          onClick={() => {
                            buyShiba(data.shibaId)
                          }}
                          onClickFloki={() => {
                            buyShibaWithFloki(data.shibaId)
                          }}
                          onClickTT={() => {
                            buyShibaTT(data.shibaId)
                          }}
                        />
                      ) : (
                        <LeashSale
                          leashName={data?.leashName}
                          leashPrice={data?.leashPrice}
                          leashUrl={data?.leashUrl}
                          onClick={() => {
                            buyLeash(data?.leashID)
                          }}
                        />
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>
            </Container>
          </Card.Body>
        </div>
      </Container>

      <main className={styles.main}>
        <div className={styles.section_app}>
          <h1 className={styles.title}>Shop</h1>
          <p className={styles.description}>Here you can buy a new Shiba Inu</p>
          <p className={styles.description}>
            Your trainer tokens: {trainerTokens}
          </p>
          <p className={styles.description}>Your Shiba Treats: {shibaTreats}</p>
          <p className={styles.description}>
            Your $SHIB balance: {shibaInu}
            {shibAllowed ? null : (
              <Button
                variant="contained"
                onClick={() => {
                  allowShib()
                }}
              >
                Allow us to spend your $SHIB
              </Button>
            )}
          </p>
          <p className={styles.description}>
            Your $FLOKI balance: {floki}
            {flokiAllowed ? null : (
              <Button
                variant="contained"
                onClick={() => {
                  allowFloki()
                }}
              >
                Allow us to spend your $FLOKI
              </Button>
            )}
          </p>
          <p className={styles.description}>
            Your $LEASH balance: {leash}
            {leashAllowed ? null : (
              <Button
                variant="contained"
                onClick={() => {
                  allowLeash()
                }}
              >
                Allow us to spend your $LEASH
              </Button>
            )}
          </p>
          <p>
            <TextField
              id="treats-count"
              variant="outlined"
              defaultValue={buyTreatsCount}
              type="number"
              onChange={handleChange}
            />
            <Button
              variant="contained"
              onClick={() => {
                buyShibaTreats()
              }}
            >
              Buy {thousandSeparator(buyTreatsCount)} Shiba Treats for{" "}
              {thousandSeparator(buyTreatsCount / 10)} $SHIB
            </Button>
          </p>
          <div className={styles.gridContainer}>
            <ShibaSale
              dogName={"Doge Killer"}
              dogPrice={200000000}
              dogPriceFloki={35000000}
              dogPriceTT={800}
              dogUrl={
                "https://ipfs.io/ipfs/QmR3sbzQQNGCi6egS2Ba9mSb1EucgXo52jEJzJm14B4H3K?filename=token-109.png"
              }
              onClick={() => {
                buyShiba(108)
              }}
              onClickFloki={() => {
                buyShibaWithFloki(108)
              }}
              onClickTT={() => {
                buyShibaTT(108)
              }}
            />
            <ShibaSale
              dogName={"Aggresive Shiba Inu"}
              dogPrice={100000000}
              dogPriceFloki={17500000}
              dogPriceTT={400}
              dogUrl={
                "https://ipfs.io/ipfs/QmZo2BVWNtCEy3qcRm31t5rLFJS7sGXuYp9TZFma7s9HYV?filename=token-110.png"
              }
              onClick={() => {
                buyShiba(109)
              }}
              onClickFloki={() => {
                buyShibaWithFloki(109)
              }}
              onClickTT={() => {
                buyShibaTT(109)
              }}
            />
            <ShibaSale
              dogName={"Bored Shiba Inu"}
              dogPrice={50000000}
              dogPriceFloki={8750000}
              dogPriceTT={200}
              dogUrl={
                "https://ipfs.io/ipfs/QmZJcKUCbCkPBfMHLyuAxj8rqUUZFDw8ESeWzMoSQWahjt?filename=token-111.png"
              }
              onClick={() => {
                buyShiba(110)
              }}
              onClickFloki={() => {
                buyShibaWithFloki(110)
              }}
              onClickTT={() => {
                buyShibaTT(110)
              }}
            />
            <ShibaSale
              dogName={"Shiba Inu"}
              dogPrice={10000000}
              dogPriceFloki={1750000}
              dogPriceTT={40}
              dogUrl={
                "https://ipfs.io/ipfs/QmZkGv9FiKtLFhtaoeux3kLoCbKgLPzVu6v2rRv8ZR5djv?filename=token-112.png"
              }
              onClick={() => {
                buyShiba(111)
              }}
              onClickFloki={() => {
                buyShibaWithFloki(111)
              }}
              onClickTT={() => {
                buyShibaTT(111)
              }}
            />
            <ShibaSale
              dogName={"Aggresive Shiba Pup"}
              dogPrice={5000000}
              dogPriceFloki={875000}
              dogPriceTT={20}
              dogUrl={
                "https://ipfs.io/ipfs/QmeTqPuKfeUEE2t3Km8Vn7XRJ5pSbm1ELX9jHAh1DinZQX?filename=token-113.png"
              }
              onClick={() => {
                buyShiba(112)
              }}
              onClickFloki={() => {
                buyShibaWithFloki(112)
              }}
              onClickTT={() => {
                buyShibaTT(112)
              }}
            />
            <ShibaSale
              dogName={"Shiba Pup"}
              dogPrice={1500000}
              dogPriceFloki={262500}
              dogPriceTT={6}
              dogUrl={
                "https://ipfs.io/ipfs/QmPkDhuQWa7nQaf32n6VmZDhDHbM7yxMVGrbgxXppcQBY9?filename=token-114.png"
              }
              onClick={() => {
                buyShiba(113)
              }}
              onClickFloki={() => {
                buyShibaWithFloki(113)
              }}
              onClickTT={() => {
                buyShibaTT(113)
              }}
            />
            <ShibaSale
              dogName={"Lucky Shiba Pack"}
              dogPrice={15000000}
              dogPriceFloki={2625000}
              dogPriceTT={60}
              dogUrl={
                "https://ipfs.io/ipfs/QmQWq4kGwieHvxxNvNgDcW5ActvfLjxWaz8pvifAi3po92?filename=token-100.png"
              }
              onClick={() => {
                buyShiba(100)
              }}
              onClickFloki={() => {
                buyShibaWithFloki(100)
              }}
              onClickTT={() => {
                buyShibaTT(100)
              }}
            />
            <LeashSale
              leashName={"Diamond Leash"}
              leashPrice={10}
              leashUrl={
                "https://ipfs.io/ipfs/QmWSjmVuznZEhF22rtZfg5f5eNMkL2QhpX4ec7FsjcfmPX?filename=token-4.png"
              }
              onClick={() => {
                buyLeash(4)
              }}
            />
            <LeashSale
              leashName={"Golden Leash"}
              leashPrice={1}
              leashUrl={
                "https://ipfs.io/ipfs/Qmeixw393YfE5ynBWCtYrv65RXveDAXMYcmuseN55YR98h?filename=token-3.png"
              }
              onClick={() => {
                buyLeash(3)
              }}
            />
            <LeashSale
              leashName={"Silver Leash"}
              leashPrice={0.1}
              leashUrl={
                "https://ipfs.io/ipfs/QmcAvCTzq8f2rTjDXB3Xdk5kUbUCx4rv5Hqgzn95brgEBB?filename=token-2.png"
              }
              onClick={() => {
                buyLeash(2)
              }}
            />
            <LeashSale
              leashName={"Iron Leash"}
              leashPrice={0.01}
              leashUrl={
                "https://ipfs.io/ipfs/QmctEAYnAgkzKB3vxcgnWxnpZD4QaTz5LL9NhdHWim33kz?filename=token-1.png"
              }
              onClick={() => {
                buyLeash(1)
              }}
            />
            <ShibaSale
              dogName={"ShibaWars Supporter Badge"}
              dogPrice={500000}
              dogPriceFloki={87500}
              dogPriceTT={2}
              dogUrl={
                "https://ipfs.io/ipfs/QmPWkTwp4Zy8pBrRr37zTTVvv136kpAwd4sLqDQqGTxn7H?filename=token-101.png"
              }
              onClick={() => {
                buyShiba(101)
              }}
              onClickFloki={() => {
                buyShibaWithFloki(101)
              }}
              onClickTT={() => {
                buyShibaTT(101)
              }}
            />
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

function thousandSeparator(x) {
  for (var i = x.toString().length - 3; i > 0; i -= 3) {
    var left = x.toString().substring(0, i)
    var right = x.toString().substring(i)
    x = left + "." + right
  }
  return x
}
