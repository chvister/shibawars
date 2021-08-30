import Header from '../components/Header'
import Footer from '../components/Footer'
import NavbarApp from '../components/NavbarApp'
import styles from '../styles/Home.module.css'
import TableRow from '../components/TableRow'

export default function Arena() {
    // # - dog id - owner address - arena score
  return (
    <div className={styles.container}>
      <Header/>
      <NavbarApp/>
      <main className={styles.main}>
        <div className={styles.section_app}>
            <h1 className={styles.title}>Arena</h1>
            <p className={styles.description}>
            Current prizepool: <span>0</span> $SHIB + <span>0</span> $LEASH
            </p>
            <div className={styles.table}>
                <TableRow rank={"#"} dogId={"Dog Id"} address={"Owner Address"} score={"Score"} share={"Share"} />
                <TableRow rank={1} dogId={1} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={1000} share={26} />
                <TableRow rank={2} dogId={2} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={900} share={20} />
                <TableRow rank={3} dogId={3} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={810} share={15} />
                <TableRow rank={4} dogId={4} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={700} share={12} />
                <TableRow rank={5} dogId={5} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={600} share={9} />
                <TableRow rank={6} dogId={6} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={500} share={7} />
                <TableRow rank={7} dogId={7} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={400} share={4} />
                <TableRow rank={8} dogId={8} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={300} share={3} />
                <TableRow rank={9} dogId={9} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={200} share={2} />
                <TableRow rank={10} dogId={10} address={"0xcbE7c78A07C59FDb5aC36836846089c7f8f5aC38"} score={100} share={1} />
            </div>
        </div>
      </main>

      <Footer/>
    </div>
  )
}