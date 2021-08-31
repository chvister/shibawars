import React from 'react'
import Image from 'next/dist/client/image'
import styles from '../styles/Home.module.css'
import { Button } from '@material-ui/core'

export default function LeashShop ({leashUrl, leashName, leashPrice}){
    return <div className={styles.dog}>
        <Image width={512} height={512} src={leashUrl}/>
        <h2>{leashName}</h2>
        <Button variant="contained">Buy for {leashPrice} $LEASH</Button>
    </div>
}