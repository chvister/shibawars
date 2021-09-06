import styles from "../../styles/Home.module.css"
import { Card, Row, Col } from "react-bootstrap"

const Team = () => {
  return (
    <div className={styles.borderCards}>
      <h1 className={styles.title}>Team</h1>
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
                Creator of Shibawars, programming, crypto, blockchain and
                decentralization fanatic. Worked on both back-end and front-end
                of Shibawars.
              </Card.Text>
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

              <Card.Text style={{ color: "white" }}>
                Passionate artist, who can spend days with her brushes. Worked
                on Shibawars NFTs and other graphics.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className={styles.box + " " + styles.card}>
            <Card.Img variant="top" src="/kaya.jpg" />
            <Card.Body className={styles.cardBody}>
              <Card.Title className={styles.description}>
                Karolína Václavíková
              </Card.Title>
              <Card.Title className={styles.description}>a.k.a Kaya</Card.Title>
              <Card.Text style={{ color: "white" }}>
                Passionate artist, who can spend days with her brushes. Worked
                on Shibawars NFTs and other graphics.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Team
