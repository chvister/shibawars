import styles from '../styles/Home.module.css'

const TableRow = ({rank, dogId, address, score, share}) => {
    return (
        <div className={styles.tableRow}>
            <div className={styles.tableCell}>{rank}</div>
            <div className={styles.tableCell}>{dogId}</div>
            <div className={styles.tableCell}>{address}</div>
            <div className={styles.tableCell}>{score}</div>
            <div className={styles.tableCell}>{share}</div>
        </div>
    )
}

export default TableRow
