import {Draw, Bet, ConstrictedInfoUser} from './drawsModels.mjs';
const SERVER_URL = 'http://localhost:3001';


const logIn = async (credentials) => {
    const response = await fetch(SERVER_URL + '/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    if(response.ok) {
      const user = await response.json();
      return user;
    }
    else {
      const errDetails = await response.text();
      throw errDetails;
    }
  };
  
  // NEW
  const getUserInfo = async () => {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
      credentials: 'include',
    });
    const user = await response.json();
    if (response.ok) {
      return user;
    } else {
      throw user;  // an object with the error coming from the server
    }
  };
  
  const getPoints = async (userId) => {
    const response = await fetch(SERVER_URL + `/api/points?userId=${userId}`,{
      method: 'GET',
      credentials: 'include',
    });
    
    if(response.ok) {
      const rankingJson = await response.json();
      return rankingJson.points;
    }
    else
      throw new Error('Internal server error');
  };
  
  // NEW
  const logOut = async() => {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
      method: 'DELETE',
      credentials: 'include'
    });
    if (response.ok)
      return null;
  }
  
  const getDraws = async () => {
    const response = await fetch(SERVER_URL + '/api/draws');
    if(response.ok) {
      const drawJson = await response.json();
      return new Draw(drawJson.id, drawJson.draw_numbers, drawJson.draw_timestamp);
    }
    else
      throw new Error('Internal server error');
  }

  const getLastDrawTimestamp = async () => {
    const response = await fetch(SERVER_URL + '/api/lastDrawTimestamp');
    if(response.ok) {
      const drawJson = await response.json();
      return drawJson.drawTimestamp;
    }
    else
      throw new Error('Internal server error');
  }

  

  const saveBet = async (bet) => {
    const response = await fetch(SERVER_URL + '/api/bet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bet)
    });
    const result = await response.json();
    console.log('saveBet result:', result);
    if (!response.ok) {
      throw new Error(result.error || 'Failed to place the bet');
    }
    
    return result;
  };

  const getRanking = async () => {
    const response = await fetch(SERVER_URL + '/api/ranking');
    if(response.ok) {
      const rankingJson = await response.json();
      const result= rankingJson.map(u => new ConstrictedInfoUser(u.id, u.name, u.points));
      return result
    }
    else
      throw new Error('Internal server error');
  }

  const API = {logIn, logOut, getUserInfo, getDraws, getLastDrawTimestamp, saveBet, getRanking, getPoints};
  export default API;