import Link from 'next/link'
import { Button } from "@material-ui/core"
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const NavbarMain = () => {
    return (
        <div className={styles.navbar}>
            <div>
                <Image src="/shibawars_logo_title_new.png" alt="Shibawars" width={1024} height={256}/>
            </div>
            <div>
                <Link href="/my_dogs" passHref>
                    <Button variant="contained">Enter app</Button>
                </Link>
                <Link href="/shibawars_whitepaper.pdf" passHref>
                    <Button target="_blank" variant="contained">Whitepaper</Button>
                </Link>
            </div>
        </div>
    )
}

export default NavbarMain
