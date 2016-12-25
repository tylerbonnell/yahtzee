var srv = require('http').Server();
var io = require('socket.io')(srv);

io.on('connection', function(socket){
  
  var game;
  
  socket.on('set name', function(name) {
    game = findOpenGame();
    game.addPlayer(socket.id);
  });
  
  socket.on('roll', function() {
    game.roll();
  });
  
  socket.on('save die', function(dieNum) {
  });
  
  socket.on('unsave die', function(dieNum) {
  });
  
  socket.on('restart', function() {
    game.restart();
  });
  
  socket.on('disconnect', function() {
    if (game)
      game.removePlayer(socket.id);
  });
});


var games = [];
function findOpenGame() {
  for (var i = 0; i < games.length + 1; i++) {
    var g = games[i];
    if (!g)
      g = games[i] = new Game();
    // not a full game
    if (!g.p1 || !g.p2)
      return games[i];
  }
}


function Game() {
  this.p1 = null;
  this.p2 = null;
  this.currentPlayer = null;
  this.rollData = null;
  this.p1Score;
  this.p2Score;
  
  // tracks players using player id (which is really just the socket id)
  this.addPlayer = function(player) {
    if (this.p1 && this.p2)
      return;
    if (!this.p1)
      this.p1 = player;
    else if (!this.p2)
      this.p2 = player;
    console.log("added player " + player);
    if (this.p1 && this.p2)
      this.startGame();
  };
  
  this.removePlayer = function(player) {
    if (this.p1 == player)
      this.p1 = null;
    else if (this.p2 == player)
      this.p2 = null;
    else
      return;
    this.currentPlayer = this.p1 || this.p2;
  };
  
  this.startGame = function() {
    console.log("starting game");
    io.to(this.p1).emit('starting game');
    io.to(this.p2).emit('starting game');
    this.currentPlayer = this.p1;
    this.rollData = {
      dice: [],
      saved: []  // array of bools
    };
    io.to(this.p1).emit('show scores', {p1: [], p2: [], possible: []}, this.p1 == this.currentPlayer);
    io.to(this.p2).emit('show scores', {p1: [], p2: [], possible: []}, this.p2 == this.currentPlayer);
  };
  
  this.roll = function() {
    for (var i = 0; i < this.rollData.saved.length; i++) {
      if (!this.rollData.saved[i]) {
        this.rollData.dice[i] = rollDie();
      }
    }
    var scores = calculatePossibleScores(this.rollData.dice);
    var shownScores = {
      p1: this.p1Score,
      p2: this.p2Score,
      possible: scores
    }
    io.to(this.p1).emit('show scores', shownScores, this.p1 == this.currentPlayer);
    io.to(this.p2).emit('show scores', shownScores, this.p2 == this.currentPlayer);
  };
  
  this.addScore = function(category) {
    var scores = calculatePossibleScores(this.rollData.dice);
    var scoreCard = this.currentPlayer == this.p1 ? this.p1Score : this.p2Score;
    scoreCard[category] = scores[category];
  }
  
  this.restart = function() {
    
  };
}

function dataToDiceState(data) {
  var res = {
    saved: [],
    unsaved: []
  }
  for (var i = 0; i < data.saved.length; i++) {
    var arr = data.saved[i] ? res.saved : res.unsaved;
    arr.push({id: i, val: data.dice[i]});
  }
  return res;
}

// Generate a number [0, 5]
function rollDie() {
  return Math.floor(Math.random() * 6);
}

// Takes a 5-long array containing the dice values
// Returns 13-long array with each categorical score
function calculatePossibleScores(dice) {
  var count1 = countDieValues(dice, 0);
  var count2 = countDieValues(dice, 1);
  var count3 = countDieValues(dice, 2);
  var count4 = countDieValues(dice, 3);
  var count5 = countDieValues(dice, 4);
  var count6 = countDieValues(dice, 5);
  var sum = count1 + count2 + count3 + count4 + count5 + count6;
  
  return [
    count1, 
    count2, 
    count3, 
    count4, 
    count5, 
    count6,
    hasNumOfAKind(dice, 3) ? sum : 0,
    hasNumOfAKind(dice, 4) ? sum : 0,
    fullHouseCount(dice),
    hasRunOf(dice, 4) ? 30 : 0,
    hasRunOf(dice, 5) ? 40 : 0,
    sum,
    YAHTZEE(dice)
  ];
}

// Used for counting 1-6 amounts
function countDieValues(dice, num) {
  var count = 0;
  for (var i = 0; i < dice.length; i++) {
    if (dice[i] == num)
      count++;
  }
  return count * num;
}

function hasNumOfAKind(dice, amount) {
  var hasAmount = 0;
  for (var i = 0; i < dice.length; i++)
    hasAmount |= dice[i] >= amount;
  return hasAmount;
}

function fullHouseCount(dice) {
  for (var i = 0; i < dice.length; i++) {
    for (var j = 0; j < dice.length; j++) {
      if (j == i)
        continue;
      if (dice[i] == 3 && dice[j] == 2)
        return 25;
    }
  }
  return 0;
}

function hasRunOf(dice, run) {
  var count = 0;
  for (var i = 0; i < dice.length; i++) {
    if (dice[i] == 0)
      count = 0;
    else
      count++;
    if (count >= run)
      return true;
  }
  return false;
}

function YAHTZEE(dice) {
  return hasNumOfAKind(dice, 5) ? 50 : 0;
}



srv.listen(3000, function(){
  console.log('listening on *:3000');
});