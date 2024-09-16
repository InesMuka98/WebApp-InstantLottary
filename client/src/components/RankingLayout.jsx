import { Row, Col } from 'react-bootstrap';
import { useEffect, useState} from 'react';
import API from '../API.mjs';


export function RankingLayout(props) {

  const [rankedUsers, setRankedUsers] = useState([]);  
  useEffect(() => {
    const getRankedUsers = async () => {
      const rankedUsers = await API.getRanking();
      setRankedUsers(rankedUsers);
    }
    getRankedUsers();
  }, []);


  return (
    <>
      <Row>
        <Col>
          <h1>Ranking</h1>
        </Col>
      </Row>
      <Row>
      <dl>
          {
            rankedUsers.map((u) => <RankingRow loggedIn={props.loggedIn} rankedUser={u} key={u.id}/>)
          }
      </dl>
        </Row>
    </>
  );
}


function RankingRow(props) {
    return (
      <>
        {props.loggedIn && 
        (<dt>
            User: {props.rankedUser.name} Points:{props.rankedUser.points}: 
        </dt>
        )}
      </>
    );
  }