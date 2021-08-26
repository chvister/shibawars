import Link from 'next/link'
import { Button } from "@material-ui/core"
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const NavbarApp = () => {
    return (
        <div className={styles.navbar}>
            <div>
                <Image src="/shibawars_logo_title_new.png" alt="Shibawars" width={1024} height={256}/>
            </div>
            <div>
                <Link href="/my_dogs" passHref>
                    <Button variant="contained">My Dogs</Button>
                </Link>
                <Link href="/arena" passHref>
                    <Button variant="contained">Arena</Button>
                </Link>
                <Link href="/shop" passHref>
                    <Button variant="contained">Shop</Button>
                </Link>
            </div>
        </div>
    )
}

export default NavbarApp
