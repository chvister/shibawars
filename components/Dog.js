import React from 'react'
import { Button } from '@material-ui/core'
import Image from 'next/dist/client/image'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'

export default function Dog ({dogData}){
    const data = dogData["dog"]
    const [uri] = useState(dogData["tokenUri"])
    const userShibaTreats = dogData["treats"]
    const shibaAdventureLevel = dogData["adventure"]
    const userLeashes = dogData["leashes"]
    const leashId = dogData["leashId"]
    const leashTokenId = dogData["leashTokenId"]

    const [imageUri, setImageUri] = useState(undefined)
    const [shibaName, setName] = useState("")
    const [shibaDesc, setDescription] = useState("")

    useEffect(() => {
        loadJson(uri)
    }, [uri])

    async function loadJson(uri) {
        let response = await fetch(uri)
        let json = await response.json()
        setImageUri(json["image"])
        setName(json["name"])
        setDescription(json["description"])
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

    const level = data["level"]

    const strength = data["strength"]
    const agility = data["agility"]
    const dexterity = data["dexterity"]

    const score = data["arenaScore"]
    const hp = data["hitPoints"]
    const uid = data["id"]

    const tokenId = data["tokenId"]

    const canFight = Math.floor(tokenId / 100) == 1 && tokenId > 103

    // TODO: button functions

    return <div className={styles.dog}>
        {imageUri === undefined ? null : <Image width={512} height={512} src={imageUri}/>}
        <h2>{shibaName} ({uid})</h2>
        <p>{shibaDesc}</p>
        <p>Level: {level}</p>
        <p>Strength: {strength / 100}</p>
        <p>Agility: {agility / 100}</p>
        <p>Dexterity: {dexterity / 100}</p>
        <p>HP: {hp / 100} / {maxHp(strength) / 100}</p>
        <p>Arena score: {score}</p>
        {userShibaTreats >= levelUpCost(level) ? 
        <Button variant="contained">Level up ({thousandSeparator(levelUpCost(level))} treats)</Button> : 
        <p>Need {thousandSeparator(levelUpCost(level) - userShibaTreats)} treats to level up</p>}
        {canFight ?  <Button variant="contained">Find match</Button> : <p>This dog can not fight</p>}
        {hp < maxHp(strength) ? <Button variant="contained">Feed</Button> : <p>This dog is not hungry</p>}
        {canFight ? <Button variant="contained">Go on adventure (level {shibaAdventureLevel})</Button> : <p>This dog can not go on an adventure</p>}
        {
            leashId == 0 ?
                userLeashes.length > 0 ? <Button variant="contained">Leash</Button> : <p>You have no free leashes</p>
            : <Button variant="contained">Unleash {leashName(leashId)}</Button>
        }
    </div>
}

function thousandSeparator(x) {
    for(var i = x.toString().length - 3; i > 0; i -= 3) {
        var left = x.toString().substring(0, i)
        var right = x.toString().substring(i)
        x = left + "." + right
    }
    return x
}