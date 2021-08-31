import React from 'react'
import Image from 'next/dist/client/image'
import styles from '../styles/Home.module.css'

export default function Dog ({dogUrl}){
    return <div className={styles.dog}>
        <Image width={512} height={512} src={dogUrl}/>
        <h2>Kriko</h2>
        <p>Not a dog. LOL</p>
    </div>
}