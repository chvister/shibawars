import { useEffect, useState } from "react"
import styles from "../../styles/Home.module.css"
import { Card, Modal, Row, Col } from "react-bootstrap"
import AOS from "aos"
import "aos/dist/aos.css"

const About = () => {
  const [show, setShow] = useState(false)
  const [targetPicture, setTargetPicture] = useState("")

  const dogImages = ["dog1.jpg", "dog2.png"]

  const handleClose = () => setShow(false)

  const handleShow = (e) => {
    var index = e.toString().lastIndexOf("/") + 1
    var filename = e.substr(index)
    setShow(true)
    setTargetPicture(filename)
  }

  const handleShowDialog = () => {
    setShow(!show)
  }

  useEffect(() => {
    AOS.init({
      duration: 800,
    })
  }, [])

  return (
    <div style={{ marginTop: "5rem" }}>
      <Card.Img
        variant="top"
        src="ABOUT.png"
        className={styles.titlePhotoAbout}
        data-aos="fade-up"
      />
      <Card.Body className={styles.description} data-aos="fade-up">
        The times of boredom have fallen upon our lands, and the breeders of
        Shiba Inu have started looking for a way to entertain themselves. And so
        they took their beloved pets and put them into the arena, where they
        fought to entertain their owners. Suddenly the activity became so
        popular, that breeders started to sell their Shibas. And to have even
        more fun, they started giving out prizes to the best arena fighters.
        Shibawars is a collection of 14 types of Shiba Inu dogs. While some are
        available for anyone to buy, some can only be found in a Lucky Shiba
        Pack with a little bit of luck and some are only awarded for OG Shiba
        Inu Token holders.
      </Card.Body>
      <div className={styles.borderCards}>
        <Row className={styles.dogsAlbumRow}>
          {dogImages.map((value, index) => {
            return (
              <Col>
                <Card.Img
                  data-aos="fade-up"
                  className={styles.dogsAlbum}
                  variant="top"
                  key={index}
                  src={value}
                  alt={value}
                  onClick={(e) => handleShow(e.target.currentSrc)}
                />
              </Col>
            )
          })}
        </Row>
      </div>
      <Modal
        show={show}
        onHide={handleClose}
        animation={false}
        style={{ marginTop: "0 auto" }}
      >
        <Modal.Body closeButton className={styles.modalWindow}>
          <>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              style={{ position: "absolute" }}
              onClick={handleShowDialog}
            ></button>

            <img
              className={styles.ModelDogImg}
              src={targetPicture}
              onClick={handleShowDialog}
              alt="no image"
            />
          </>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default About
