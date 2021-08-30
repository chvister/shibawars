import Link from 'next/link'
import { Button } from "@material-ui/core"
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useMoralis } from 'react-moralis'
import CircularProgress from '@material-ui/core/CircularProgress'
import AlertDialog from './AlertDialog'

const NavbarApp = () => {
    const { authenticate, isAuthenticated, authError, isAuthenticating, logout } = useMoralis();

    return (
        <div className={styles.navbar}>
            <div>
                <Image src="/shibawars_logo_title_new.png" alt="Shibawars" width={1024} height={256}/>
            </div>
            <div>
                {
                    authError ? 
                    <AlertDialog title={"Error"} text={authError.message}/>
                    : null
                }
                {isAuthenticated ? null : 
                    <Button hidden="true" variant="contained" onClick={() => authenticate() } disabled={isAuthenticating}>
                        { isAuthenticating ? <CircularProgress size={20}/> : "Login" }
                    </Button> 
                }
                <Link href="/my_dogs" passHref>
                    <Button variant="contained">My Dogs</Button>
                </Link>
                <Link href="/arena" passHref>
                    <Button variant="contained">Arena</Button>
                </Link>
                <Link href="/shop" passHref>
                    <Button variant="contained">Shop</Button>
                </Link>
                {isAuthenticated ? <Button hidden="true" variant="contained" onClick={() => logout() }>Logout</Button> : null }
            </div>
        </div>
    )
}

export default NavbarApp
