import { Row, Col } from 'react-bootstrap';
import { Link } from "react-router-dom";

export function WelcomeLayout(props) {
  return (
    <>
      <Row>
        <Col>
        <h1 className="text-primary text-center">Welcome to Instant Lottery!</h1>
        </Col>
      </Row>
      <Row>
        <Col>
        {props.loggedIn ? 
        <h2 className="text-secondary text-center">Ready to play <span className="badge text-bg-secondary">{props.user.name}</span> ?</h2>
        : <h3 className="text-warning">Sorry but you can not play if not logged in!</h3>} 
        </Col>
        </Row>
        <Row>
        <Col>
        <h4 className="text-primary">The game goes like this... </h4>
        <div className="fs-6">
        <p>Every 2 minutes 5 numbers between 0 and 90 are drawn <span className="text-body-tertiary">(solemn silence to set the scene)</span></p> 
        <p> They are random, distinct, and SECRET <span className="text-body-tertiary">(no worries..we will show you the previous draw)</span></p>
        <p>All players will bet on the same 5 numbers <span className="text-body-tertiary">(we are fair like that :D)</span></p>
        <p>You can put up to 3 numbers in your bet... BUT only 1 bet for each draw <span className="text-body-tertiary">(you can try but you will fail)</span></p>
        <p>And of course..you will pay for your bet accordingly! 5 points for each number! <span className="text-body-tertiary">('watching you' emoji!)</span></p>
        <p>You start from 100 points and can only increase them by winning bets <span className="text-body-tertiary">(tempting? 'smirk face'emoji)</span></p> 
        <p> Careful not to reach 0...you won't be able to place a bet anymore <span className="text-body-tertiary">(well life isn't fair either..)</span></p>
        <p>So why wait anymore?! Let's have fun!!!</p>
        </div>
        {props.loggedIn && <div className="d-grid gap-2 col-6 mx-auto"><Link className="btn btn-lg btn-primary" to={`draws`}>Play</Link></div>}  
        </Col>
        </Row>
    </>
  );
}