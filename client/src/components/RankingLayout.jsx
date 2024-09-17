import { Row, Col, Table } from 'react-bootstrap';
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
      {props.loggedIn ? (
      <>
      <Row>
        <Col>
          <h2 className='text-secondary text-center'>Ranking</h2>
        </Col>
      </Row>
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <Table className='table table-hover mx-auto'>
            <thead>
              <tr>
                <th scope='col' className='text-primary text-center'>User</th>
                <th scope='col'className='text-primary text-center'>Points</th>
              </tr>
            </thead>
            <tbody>
              {
                rankedUsers.map((u) => <RankingRow loggedIn={props.loggedIn} rankedUser={u} key={u.id}/>)
              }
            </tbody> 
          </Table>
        </Col>
      </Row>
      </>
      ) :
      (<h3 className="fs-6 text-danger">Please log in see the ranking!</h3>)  
      }
    </> 
  );
}


function RankingRow(props) {
    return (
      <>
        {props.loggedIn && 
        (<tr className='table-secondary text-center'>
          <td>{props.rankedUser.name}</td>
          <td>{props.rankedUser.points}</td>
        </tr>
        )}
      </>
    );
  }