import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Link from 'next/link'

const Footer = () => {
    return (
        <footer className={styles.footer}>
        &copy; 2021 Kriko &amp; Friends &nbsp; 
        <Link href="https://twitter.com/ShibaWars">
            <Image src="/twitter3.png" alt="Twitter" width={36} height={36}/> 
        </Link> &nbsp;
        <Image src="/etherscan.png" alt="Etherscan" width={36} height={36}/> &nbsp;
        <Image src="/reddit.png" alt="Reddit" width={36} height={36}/>&nbsp;
        <Image src="/discord.png" alt="Discord" width={36} height={36}/>&nbsp;
        </footer>
    )
}

export default Footer
