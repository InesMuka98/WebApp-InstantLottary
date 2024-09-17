import { Container, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LogoutButton } from './AuthComponents';

function NavHeader (props) {
  return(
    <Navbar navbar-expand-lg='true' bg='primary' data-bs-theme='dark'>
      <Container fluid>
        <Link to='/' className='navbar-brand'>Instant Lottery</Link>
        {props.loggedIn ? 
          <>
          <div className="d-inline-flex gap-2">
          <Link to='/ranking'className='btn btn-outline-light'>Ranking</Link>
          <LogoutButton logout={props.handleLogout}/>
          </div>
          </>:
          <Link to='/login'className='btn btn-outline-light'>Login</Link>
        }
      </Container>
    </Navbar>
  );
}

export default NavHeader;
