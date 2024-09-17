import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import {useState, useEffect} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../API.mjs';
import dayjs from 'dayjs';


export function BetLayout(props) {
  const [message, setMessage] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [betClosed, setBetClosed] = useState(false);
  const [points, setPoints] = useState(0);  

  useEffect(() => {
    let drawTime = null; // Store the draw time globally within the effect
  
    const calculateTimeLeft = () => {
      const now = dayjs();
      const elapsedTime = now.diff(drawTime, 'second');
      const countdown = Math.max(120 - elapsedTime, 0); // 2 minutes countdown
      setTimeLeft(countdown);
  
      if (countdown <= 0) {
        setBetClosed(true);
        refetchDrawTime(); // When countdown reaches 0, refetch the draw time
      } else {
        setBetClosed(false);
      }
    };
  
    const refetchDrawTime = async () => {
      drawTime = await API.getLastDrawTimestamp(); // Refetch the timestamp once countdown reaches 0
    };
  
    const startCountdown = async () => {
      drawTime = await API.getLastDrawTimestamp(); // Fetch the timestamp once when component mounts
      calculateTimeLeft(); // Start the countdown immediately
  
      const interval = setInterval(() => {
        calculateTimeLeft();
      }, 1000); // Update the countdown every second
  
      return () => clearInterval(interval); // Cleanup the interval on unmount
    };
    if (props.location.pathname === '/draws/bet'){
        startCountdown(); // Trigger the initial draw fetch and countdown
    }
  }, []);


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
        {props.loggedIn && <h2 className="text-secondary text-center">Your chance to shine <span className="badge text-bg-secondary">{props.user.name}</span> ! </h2>}
        </Col>
      </Row>
      <Row>
        {props.loggedIn ? (
          props.draw ? (
            <>
            <div className="text-center">
            <p className="fs-6">Last draw: <span className="fs-4 badge text-bg-secondary">{props.draw.draw_numbers}</span> on {props.draw.draw_timestamp.format('YYYY-MM-DD HH:mm:ss')}</p>
            {betClosed ? (
                <div className="fs-6"><p className="text-warning">Bets are closed for this draw! Wait for next one!</p></div>
            ):(
                <p>Time left to place your bet: <span className="fs-4 badge text-bg-secondary">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span> minutes</p>
            )}
            <p className="fs-6">Your points now: <span className="fs-4 badge text-bg-secondary">{points}</span></p>
            </div>
            {/* Display the message */}
            {message && (
                <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
                  {message.msg}
                </Alert>
              )}
            <BetForm user={props.user} draw={props.draw} setMessage={setMessage} setPoints={setPoints}/>
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
        }
        try{
          const result = await API.saveBet({
            userId: props.user.id,
            drawId: currentDrawId,
            betNumbers: formattedBetNumbers,
            betTimestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          });
          if (result.success) {
            props.setMessage({ msg: 'Bet placed successfully! Wait until the next draw', type: 'success' });
            const newPoints = await API.getPoints(props.user.id);
            props.setPoints(newPoints);
          }
        } catch (err) {
          console.error('Error placing bet: ', err);
          props.setMessage({ msg: err.message , type: 'danger' });
        }
  };
  return (
    <Row className="justify-content-center">
      <Col md={6}>
        <Form onSubmit={handleSubmit}> {betNumbers.map((bet, index) => (
           <Form.Group key={index} className='mb-3'>
           <Form.Label>{index + 1}st Guess</Form.Label>
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
