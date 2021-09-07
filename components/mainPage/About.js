import styles from "../../styles/Home.module.css"
import { Card } from "react-bootstrap"
import Image from "next/image"

const About = () => {
  return (
    <div style={{ marginTop: "5rem" }}>
      <Card.Img
        variant="top"
        src="ABOUT.png"
        className={styles.titlePhotoAbout}
      />
      <Card.Body className={styles.description}>
        The times of boredom have fallen upon our lands, and the breeders of
        Shiba Inu have started looking for a way to entertain themselves. And so
        they took their beloved pets and put them into the arena, where they
        fought to entertain their owners. Suddenly the activity became so
        popular, that breeders started to sell Shibas. And to have even more
        fun, they started giving out prizes to the best arena fighters.
        Shibawars is a collection of 14 types of Shiba Inu dogs. While some are
        available for anyone to buy, some can only be found in a Lucky Shiba
        Pack with a little bit of luck and some are only awarded for OG Shiba
        Inu Token holders.
      </Card.Body>
    </div>
  )
}

export default About
