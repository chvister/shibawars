import styles from '../styles/Home.module.css'

const TableRow = ({ rank, dogId, address, score, shib, leash, floki }) => {
    return (
        <div className={styles.tableRow}>
            <div className={styles.tableCell}>{rank}</div>
            <div className={styles.tableCell}>{dogId}</div>
            <div className={styles.tableCell}>{address}</div>
            <div className={styles.tableCell}>{score}</div>
            <div className={styles.tableCell}>
                {
                    rank == "#" ? "Reward"
                        : <p>
                            <p>{shib} $SHIB</p>
                            <p>{leash} $LEASH</p>
                            <p>{floki} $FLOKI</p>
                        </p>
                }
            </div>
        </div>
    )
}

export default TableRow
