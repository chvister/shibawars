import { useEffect } from "react"
import styles from "../../styles/Home.module.css"
import { Card } from "react-bootstrap"
import AOS from "aos"
import "aos/dist/aos.css"

const ContactUs = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
    })
  }, [])
  return (
    <>
      <div style={{ marginTop: "5rem" }}>
        <Card.Img
          variant="top"
          src="cotactUs.png"
          className={styles.titleContactUS}
          data-aos="fade-up"
        />
        <Card.Body className={styles.description} data-aos="fade-up">
          You can contact us{" "}
          <a
            href="mailto:shibawarsofficial@gmail.com?subject=contact us"
            target="_blank"
            className={styles.externalLink}
          >
            here.
          </a>
        </Card.Body>
      </div>
    </>
  )
}

export default ContactUs
