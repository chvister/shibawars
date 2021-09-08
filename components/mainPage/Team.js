import styles from "../../styles/Home.module.css"
import { Card, Row, Col } from "react-bootstrap"
import { SocialIcon } from "react-social-icons"

const Team = () => {
  return (
    <div className={styles.borderCards}>
      <Card.Img
        variant="top"
        src="TEAM.png"
        className={styles.titlePhotoTeam}
      />
      <Row>
        <Col>
          <Card className={styles.box}>
            <Card.Img variant="top" src="/kriko.jpg" />

            <Card.Body className={styles.cardBody}>
              <Card.Title className={styles.description}>
                Dominik Krížo
              </Card.Title>
              <Card.Title className={styles.description}>
                a.k.a Kriko
              </Card.Title>
              <Card.Text className={styles.cardDescription}>
                Creator of Shibawars, programming, crypto, blockchain, and
                decentralization fanatic. Worked on both back-end and front-end
                of Shibawars.
              </Card.Text>
              <div className={styles.teamSocialContainer}>
                <SocialIcon
                  url="https://twitter.com/Coreggon1"
                  style={{ height: 40, width: 40, margin: "5px" }}
                  fgColor="white"
                  target="_blank"
                  rel="noopener noreferrer"
                />
                <SocialIcon
                  url="https://www.linkedin.com/in/dominik-kr%C3%AD%C5%BEo-7a4677138/"
                  style={{ height: 40, width: 40, margin: "5px" }}
                  fgColor="white"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className={styles.box}>
            <Card.Img variant="top" src="/kaya.jpg" />
            <Card.Body className={styles.cardBody}>
              <Card.Title className={styles.description}>
                Karolína Václavíková
              </Card.Title>
              <Card.Title className={styles.description}>a.k.a Kaya</Card.Title>

              <Card.Text className={styles.cardDescription}>
                Passionate artist, who can spend days with her brushes. Worked
                on Shibawars NFTs and other graphics.
              </Card.Text>
              <div className={styles.teamSocialContainer}>
                <SocialIcon
                  url="https://twitter.com/karvacart"
                  style={{ height: 40, width: 40, margin: "5px" }}
                  fgColor="white"
                  target="_blank"
                  rel="noopener noreferrer"
                />
                <SocialIcon
                  url="https://www.instagram.com/karvacart/"
                  style={{ height: 40, width: 40, margin: "5px" }}
                  fgColor="white"
                  target="_blank"
                  rel="noopener noreferrer"
                />{" "}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className={styles.box}>
            <Card.Img variant="top" src="/martinko.jpg" />
            <Card.Body className={styles.cardBody}>
              <Card.Title className={styles.description}>
                Martin Stolár
              </Card.Title>
              <Card.Title className={styles.description}>
                a.k.a Chvister
              </Card.Title>
              <Card.Text className={styles.cardDescription}>
                Full-stack developer and crypto enthusiast. Shibawars community
                manager who also worked on the majority of Shibawars front-end.
              </Card.Text>
              <div className={styles.teamSocialContainer}>
                <SocialIcon
                  url="https://twitter.com/chvisterko"
                  style={{ height: 40, width: 40, bottom: "5px" }}
                  fgColor="white"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Team
