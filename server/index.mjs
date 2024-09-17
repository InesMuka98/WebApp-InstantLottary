// imports
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import {check, validationResult} from 'express-validator';
import {getUser, getUserById, listRankedUsers, getPoints} from './user-dao.mjs';
import {getCurrentDraw, getLastCompletedDraw} from './draw_dao.mjs';
import { generateAndStoreDraw } from './draw_dao.mjs'; 
import { calculatePointsSpent, getBetForDraw, calculatePointsWon, placeBetAndUpdatePoints } from './bet_dao.mjs'; 
import dayjs from 'dayjs';

// Passport-related imports -- NEW
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';


// init express
const app = new express();
const port = 3001;

// middleware
app.use(express.json());
app.use(morgan('dev'));
// set up and enable CORS -- UPDATED
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions));

// Passport: set up local strategy -- NEW
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await getUser(username, password);
  if(!user)
    return cb(null, false, 'Incorrect username or password.');
    
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) { // this user is id + email + name
  return cb(null, user);
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

app.use(session({
  secret: "did not forget to change this",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


// Schedule a new draw every 2 minutes (120,000 milliseconds)
setInterval(async () => {
  try {
    const newNumbers = await generateAndStoreDraw();
    console.log('New draw generated:', newNumbers);
  } catch (error) {
    console.error('Error generating new draw:', error);
  }
}, 120000);  // 2 minutes in milliseconds



// GET /api/draws
app.get('/api/draws', isLoggedIn, (request, response) => {
  getLastCompletedDraw()
  .then(draws => {
    if(draws)
      response.json(draws);
    else
    response.status(404).json({ error: 'No draws found' });
  })
  .catch(() => response.status(500).end());
});

app.get('/api/lastDrawTimestamp', isLoggedIn, (request, response) => {
  getCurrentDraw()
  .then(draws => {
    if(draws)
      response.json({drawTimestamp: draws.draw_timestamp});
    else
    response.status(404).json({ error: 'No draws found' });
  })
  .catch(() => response.status(500).end());
});

app.post('/api/bet', isLoggedIn, [
  check('userId').notEmpty().withMessage('userId is required'),
  check('drawId').notEmpty().withMessage('drawId is required'),
  check('betNumbers').isArray().withMessage('betNumbers must be an array'),
  check('betTimestamp').custom((value) => {
    // Use dayjs to check if the format is correct
    if (!dayjs(value, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
      throw new Error('betTimestamp must be a valid date in the format YYYY-MM-DD HH:mm:ss');
    }
    return true;
  })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array()});
    }

    const { userId, drawId, betNumbers, betTimestamp} = req.body;
    //console.log('Received bet submission:', { userId, drawId, betNumbers, betTimestamp });

    // 1. Get the player's current points
    const user = await getUserById(userId);
    const pointsSpent =  calculatePointsSpent(betNumbers.length);

    // 2. Check if they have enough points
    if (user.points < pointsSpent) {
      return res.status(400).json({ error: 'Not enough points to place this bet' });
    }

    // 3. Check if the bet is placed within the allowed window (before draw)
    const currentDraw = await getCurrentDraw();
    const currentDrawId =currentDraw.id;
    if (drawId !== currentDrawId) {
      return res.status(400).json({ error: 'Cannot place a bet after the draw has occurred' });
    }
    //check if bet already placed for that draw
    const bet = await getBetForDraw(userId, drawId);
    if (bet) {
      console.log('Bet already placed for this draw');
      return res.status(400).json({ error: 'Bet already placed for this draw' });
    }

    const winningNumbers = currentDraw.draw_numbers;
    const winningNumbersArray = winningNumbers.split(',').map(num => parseInt(num));  
    //console.log('Winning numbers:', winningNumbers);
    //console.log('Winning numbers array', winningNumbersArray);
    //console.log('Bet numbers:', betNumbers);
    //console.log('user.points', user);
    const correctGuesses = betNumbers.filter(num => winningNumbersArray.includes(num)).length;
    const pointsWon = calculatePointsWon(correctGuesses);
    try{
      await placeBetAndUpdatePoints(userId, user.points, drawId, betNumbers, pointsSpent, correctGuesses, pointsWon, betTimestamp);
      res.status(200).json({ success: true, points: user.points - pointsSpent });
    }catch(err){
      console.error('Error placing bet and updating points:', err);
      res.status(500).json({ error: 'Failed to place the bet' });
    }
  }
);

app.get('/api/ranking', isLoggedIn, (request, response) => {
  listRankedUsers()
  .then(rankedUsers => response.json(rankedUsers))
  .catch(() => response.status(500).end());
});


app.get('/api/points', isLoggedIn, (request, response) => {
  const {userId} = request.query;
  getPoints(userId)
  .then(user => {
    if(user)
      response.json({points: user.points});
    else
    response.status(404).json({ error: 'No points found' });
  })
  .catch(() => response.status(500).end());
});

// POST /api/sessions -- NEW
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).send(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        return res.status(201).json(req.user);
      });
  })(req, res, next);
});

// GET /api/sessions/current -- NEW
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current -- NEW
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});


// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});