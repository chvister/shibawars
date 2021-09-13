import React from 'react'
import Image from 'next/dist/client/image'
import { Button } from '@material-ui/core'
import styles from '../styles/Home.module.css'

export default function ShibaSale({ dogUrl, dogName, dogPrice, dogPriceTT, onClick, onClickTT }) {
    return <div className={styles.dog}>
        <Image width={512} height={512} src={dogUrl} />
        <h2>{dogName}</h2>
        <Button variant="contained" onClick={onClick}>Buy for {thousandSeparator(dogPrice)} $SHIB</Button>
        <Button variant="contained" onClick={onClickTT}>Buy for {dogPriceTT} Trainer Tokens</Button>
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