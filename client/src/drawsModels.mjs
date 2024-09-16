import dayjs from 'dayjs';

function Draw(id, draw_numbers, draw_timestamp) {
    this.id =id;
    this.draw_numbers = draw_numbers;
    this.draw_timestamp = dayjs(draw_timestamp);
  }

function Bet(id, user_id, draw_id, bet_numbers, points_spent, correct_guesses, points_won, bet_timestamp) {
    this.id = id;
    this.user_id = user_id;
    this.draw_id = draw_id;
    this.bet_numbers = bet_numbers;
    this.points_spent = points_spent;
    this.correct_guesses = correct_guesses;
    this.points_won = points_won;
    this.bet_timestamp = dayjs(bet_timestamp);
}  

function ConstrictedInfoUser(id, name, points) {
    this.id = id;
    this.name = name;
    this.points = points;
} 
  
  export { Draw, Bet, ConstrictedInfoUser };
  