import { useEffect } from "react"
import styles from "../../styles/Home.module.css"
import { Card } from "react-bootstrap"
import AOS from "aos"
import "aos/dist/aos.css"

const Whitepaper = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
    })
  }, [])
  return (
    <>
      <Card.Img
        variant="top"
        src="WHITEPAPER.png"
        className={styles.titlePhotoWhitepaper}
        data-aos="fade-up"
      />
      <Card.Body className={styles.description} data-aos="fade-up">
        You can read our whitepaper
        <a
          href="/shibawars_whitepaper.pdf"
          target="_blank"
          className={styles.externalLink}
        >
          here
        </a>
      </Card.Body>
    </>
  )
}

export default Whitepaper
