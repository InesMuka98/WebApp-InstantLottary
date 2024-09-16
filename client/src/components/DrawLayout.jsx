import { Row, Col } from 'react-bootstrap';
import { Link } from "react-router-dom";

export function DrawLayout(props) {
  return (
    <>
      <Row>
        <Col>
          <h1>Ready to play</h1>
        </Col>
      </Row>
      <Row>
        {props.loggedIn ? (
          props.draw ? (
            <>
            <p>Last draw: {props.draw.draw_numbers} on {props.draw.draw_timestamp.format('YYYY-MM-DD HH:mm:ss')}</p>
            <p>{props.loggedIn && <Link className='btn btn-primary mx-1 ' to={`bet`}>Bet now</Link>}</p>
            </>
          ) : (
            <p>No draw available yet. Please wait for the next draw.</p>
          )
        ) : (
          <p>Please log in to see the latest draw.</p>
        )}  
      </Row>
    </>
  );
}
