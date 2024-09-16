import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import {useState, useEffect} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../API.mjs';
import dayjs from 'dayjs';


export function BetLayout(props) {
  const [message, setMessage] = useState(null);
  //const [timeLeft, setTimeLeft] = useState(0);
  //const [betClosed, setBetClosed] = useState(false);
  const [points, setPoints] = useState(0);  

  useEffect(() => {
    const getPoints = async () => {
      const points = await API.getPoints(props.user.id);
      setPoints(points);
    }
    getPoints();
  }, []);

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
            <p>{props.user.name}, you have only {points} left</p>
            {props.betClosed ? (
                <p>Bets are closed for this draw. Wait for the next draw...</p>
            ):(
                <p>Time left to place your bet: {Math.floor(props.timeLeft / 60)}:{String(props.timeLeft % 60).padStart(2, '0')} minutes</p>
            )}
            {/* Display the message */}
            {message && (
                <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
                  {message.msg}
                </Alert>
              )}
            <BetForm user={props.user} draw={props.draw} setMessage={setMessage}/>
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

export function BetForm(props) {
    const [betNumbers, setBetNumbers] = useState(['', '', '']);
    const navigate = useNavigate();
    const handleSubmit = async (event) => {
        event.preventDefault();
        const formattedBetNumbers = betNumbers
        .filter(num => num.trim() !== '')  // Exclude empty fields
        .map(num => parseInt(num.trim(), 10));  // Convert non-empty strings to integers
        const lastCompletedDrawId = props.draw.id;
        const currentDrawId = lastCompletedDrawId + 1;
        if (formattedBetNumbers.length === 0 || formattedBetNumbers.some(num => isNaN(num) || num < 1 || num > 90) ||
            new Set(formattedBetNumbers).size !== formattedBetNumbers.length) {
                props.setMessage({ msg: 'Please enter valid distinct numbers between 1 and 90.', type: 'danger' });
                return;
            return;
        }
        await API.saveBet({
                userId: props.user.id,
                drawId: currentDrawId,
                betNumbers: formattedBetNumbers,
                betTimestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            }).then(() => {props.setMessage({ msg: 'Bet placed successfully!', type: 'success' });
            navigate('/draws');}).catch((err) => {
                console.error('Error placing bet: ', err);
                props.setMessage({ msg: err.message , type: 'danger' });
            });
  };
  return (
    <Row>
      <Col md={6}>
        <Form onSubmit={handleSubmit}> {betNumbers.map((bet, index) => (
           <Form.Group key={index} className='mb-3'>
           <Form.Label>{index + 1}st Bet</Form.Label>
           <Form.Control
             type='text'
             value={bet}
             onChange={(ev) => {
               const newBets = [...betNumbers];
               newBets[index] = ev.target.value;
               setBetNumbers(newBets);
             }}
           />
         </Form.Group>
       ))}
       <Button variant='success' type='submit'>Place Bet</Button>
       <Link className='btn btn-danger mx-2 my-2' to={'/draws'}>Cancel</Link>
     </Form>
   </Col>
 </Row>
);
}

/*
export function CountdownTimer(props){
    const [timeLeft, setTimeLeft] = useState(getTimeLeft());
    useEffect(() => {
        const timerId = setInterval(() => {
            setTimeLeft(getTimeLeft());
        }, 1000);
        return () => clearInterval(timerId);
    }, [props.draw.draw_timestamp]);

    function getTimeLeft(){
        const now = dayjs();
        const drawTime = dayjs(props.draw.draw_timestamp);
        const timeLeft = drawTime.diff(now, 'second');
        return timeLeft;
    }
    return <p>Time left to place your bet: {timeLeft} seconds</p>;
}*/