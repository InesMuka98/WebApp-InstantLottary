import { Row, Col } from 'react-bootstrap';
import { Link } from "react-router-dom";

export function WelcomeLayout(props) {
  return (
    <>
      <Row>
        <Col>
          <h1>Welcome to Instant Lottery!</h1>
        </Col>
      </Row>
      <Row>
        <Col>
        {props.loggedIn ? <h3>Ready to play {props.user.name}</h3> : <h3>Sorry but you can not play if not logged in</h3>} 
        {props.loggedIn && <Link className="btn btn-primary mb-4" to={`draws`}>Play</Link>}
        {props.loggedIn && <Link className="btn btn-primary mb-4" to={`ranking`}>Ranking</Link>}      
        </Col>
        </Row>
    </>
  );
}