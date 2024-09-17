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
      credentials: 'include'
    });
    const user = await response.json();
    if (response.ok) {
      return user;
    } else {
      throw user; 
    }
  };
  
  const getPoints = async (userId) => {
    const response = await fetch(SERVER_URL + `/api/points?userId=${userId}`,{
      credentials: 'include'
    });
    const result = await response.json();
    if(response.ok) {
      return result.points;
    }
    else
      throw new Error(result.error);
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
    const response = await fetch(SERVER_URL + '/api/draws',{
      credentials: 'include'
    });
    const result = await response.json();
    if(response.ok) {
      return new Draw(result.id, result.draw_numbers, result.draw_timestamp);
    }
    else
      throw new Error(result.error);
  }

  const getLastDrawTimestamp = async () => {
    const response = await fetch(SERVER_URL + '/api/lastDrawTimestamp',{
      credentials: 'include'
    });
    const result = await response.json();
    if(response.ok) {
      return result.drawTimestamp;
    }
    else
      throw new Error(result.error);
  }

  

  const saveBet = async (bet) => {
    const response = await fetch(SERVER_URL + '/api/bet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bet),
      credentials: 'include'
    });
    const result = await response.json();
    //console.log('saveBet result:', result);
    if (!response.ok) {
      throw new Error(result.error);
    }
    return result;
  };

  const getRanking = async () => {
    const response = await fetch(SERVER_URL + '/api/ranking',{
      credentials: 'include'
    });
    const preResult = await response.json();
    if(response.ok) {
      const result= preResult.map(u => new ConstrictedInfoUser(u.id, u.name, u.points));
      return result
    }
    else
      throw new Error(preResult.error);
  }

  const API = {logIn, logOut, getUserInfo, getDraws, getLastDrawTimestamp, saveBet, getRanking, getPoints};
  export default API;