import { Row, Col } from 'react-bootstrap';
import { Link } from "react-router-dom";

export function DrawLayout(props) {
  return (
    <>
      <Row>
        <Col>
        {props.loggedIn && <h2 className="text-secondary text-center">One step closer <span className="badge text-bg-secondary">{props.user.name}</span> ... </h2>}
        </Col>
      </Row>
      <Row>
        {props.loggedIn ? (
          props.draw ? (
            <>
            <div className="text-center">
            <p className="fs-6">Last draw: <span className="fs-4 badge text-bg-secondary">{props.draw.draw_numbers}</span> on {props.draw.draw_timestamp.format('YYYY-MM-DD HH:mm:ss')}</p>
            </div>
            <p>{props.loggedIn && <div className="d-grid gap-2 col-6 mx-auto"><Link className="btn btn-lg btn-primary" to={`bet`}>Bet Now</Link></div>}</p>
            </>
          ) : (
            <p className="fs-6 text-warning">No draw available yet. Please wait for the next draw.</p>
          )
        ) : (
          <h3 className="fs-6 text-danger">Please log in to play!</h3>
        )}  
      </Row>
    </>
  );
}
