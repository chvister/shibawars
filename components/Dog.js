import React from 'react'
import { Button } from '@material-ui/core'
import Image from 'next/dist/client/image'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'

export default function Dog({ dogData, factoryContract, account, onOpen, shibaWarsContract, arenaContract, showFight }) {
    const data = dogData["dog"]
    const [uri] = useState(dogData["tokenUri"])
    const userShibaTreats = dogData["treats"]
    const shibaAdventureLevel = dogData["adventure"]
    const userLeashes = dogData["leashes"]
    const leashId = dogData["leashId"]
    const leashTokenId = dogData["leashTokenId"]
    const [trainerTokenReward, setTrainerTokenReward] = useState(0)

    const [imageUri, setImageUri] = useState(undefined)
    const [shibaName, setName] = useState("")
    const [shibaDesc, setDescription] = useState("")

    const level = data["level"]

    const strength = data["strength"]
    const agility = data["agility"]
    const dexterity = data["dexterity"]
    const power = data["power"]

    const score = data["arenaScore"]
    const hp = data["hitPoints"]
    const uid = data["id"]

    const tokenId = data["tokenId"]
    const inArena = data["inArena"]

    const canFight = Math.floor(tokenId / 100) == 1 && tokenId > 103

    useEffect(() => {
        loadJson(uri)
    }, [uri])

    async function loadJson(uri) {
        let response = await fetch(uri)
        let json = await response.json()
        setImageUri(json["image"])
        setName(json["name"])
        setDescription(json["description"])
        const reward = await factoryContract.methods.getTrainerTokenReward(tokenId).call({ from: account, gasLimit: 125000 })
        setTrainerTokenReward(reward)
    }

    async function recycleShiba() {
        factoryContract.methods.recycleShiba(data["id"]).send({ from: account, gasLimit: 150000 })
            .on("receipt", (async () => {
                onOpen()
            }))
    }

    async function queueToArena() {
        arenaContract.methods.queueToArena(uid).send({ from: account, gasLimit: 325000 })
            .on("receipt", (async (receipt) => {
                onOpen()
                showFight(receipt)
            }))
    }

    async function goOnAdventure() {
        arenaContract.methods.goOnAdventure(uid).send({ from: account, gasLimit: 150000 })
            .on("receipt", (async (receipt) => {
                onOpen()
                showFight(receipt)
            }))
    }

    async function openPack() {
        factoryContract.methods.openPack(uid).send({ from: account, gasLimit: 500000 })
            .on("receipt", (async () => {
                onOpen()
            }))
    }

    async function levelUp() {
        shibaWarsContract.methods.levelUp(uid).send({ from: account, gasLimit: 100000 })
            .on("receipt", (async () => {
                onOpen()
            }))
    }

    async function feed() {
        shibaWarsContract.methods.feed(uid).send({ from: account, gasLimit: 75000 })
            .on("receipt", (async () => {
                onOpen()
            }))
    }

    function maxHp(strength) {
        return strength * 5 + 5000
    }

    function levelUpCost(level) {
        return level * 150000
    }

    function leashName(id) {
        if (id == 1) {
            return "Iron Leash"
        } else if (id == 2) {
            return "Silver Leash"
        } else if (id == 3) {
            return "Golden Leash"
        } else if (id == 4) {
            return "Diamond Leash"
        }
        return "";
    }

    if (tokenId <= 101) {
        return (
            <div className={styles.dog}>
                {imageUri === undefined ? null : <Image width={512} height={512} src={imageUri} />}
                <h2>{shibaName} ({uid})</h2>
                <p>{shibaDesc}</p>
                {tokenId == 100 ? <Button variant="contained" onClick={() => { openPack() }}>Open pack</Button> : null}
            </div>)
    }

    return <div className={styles.dog}>
        {imageUri === undefined ? null : <Image width={512} height={512} src={imageUri} />}
        <h2>{shibaName} ({uid})</h2>
        <p>{shibaDesc}</p>
        <p>Level: {level}</p>
        <p>Strength: {strength / 100}</p>
        <p>Agility: {agility / 100}</p>
        <p>Dexterity: {dexterity / 100}</p>
        <p>Power: {power / 100}%</p>
        <p>HP: {hp / 100} / {maxHp(strength) / 100}</p>
        <p>Arena score: {score}</p>
        {userShibaTreats >= levelUpCost(level) ?
            <Button variant="contained" onClick={() => { levelUp() }}>Level up ({thousandSeparator(levelUpCost(level))} treats)</Button> :
            <p>Need {thousandSeparator(levelUpCost(level) - userShibaTreats)} treats to level up</p>}
        {canFight ?
            inArena == 0 && hp > 1 ?
                <Button variant="contained" onClick={() => { queueToArena() }}>Find match</Button>
                : hp == 1 ? <p>This dog is too exhausted to fight</p> : <p>This dog is waiting for a fight</p>
            : <p>This dog can not fight</p>}
        {hp < maxHp(strength) && userShibaTreats >= maxHp(strength) - hp ?
            <Button variant="contained" onClick={() => { feed() }}>Feed ({thousandSeparator(maxHp(strength) - hp)} treats)</Button>
            : hp < maxHp(strength) ? <p>Not enough Treats to feed this Shiba</p> : <p>This dog is not hungry</p>}
        {canFight ?
            inArena == 0 && hp > 1 ?
                <Button variant="contained" onClick={() => { goOnAdventure() }}>Go on adventure (level {shibaAdventureLevel})</Button>
                : hp == 1 ? <p>This dog is too exhausted to go on an adventure</p> : <p>This dog is waiting for a fight</p>
            : <p>This dog can not go on an adventure</p>}
        {
            leashId == 0 ?
                userLeashes.length > 0 ? <Button variant="contained">Leash</Button> : <p>You have no free leashes</p>
                : <Button variant="contained">Unleash {leashName(leashId)}</Button>
        }
        {
            trainerTokenReward != 0 ? <Button variant="contained" onClick={() => { recycleShiba() }}>Recycle for {trainerTokenReward} Trainer Tokens</Button> : null
        }
    </div>
}

function thousandSeparator(x) {
    for (var i = x.toString().length - 3; i > 0; i -= 3) {
        var left = x.toString().substring(0, i)
        var right = x.toString().substring(i)
        x = left + "." + right
    }
    return x
}