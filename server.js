var srv = require('http').Server();
var io = require('socket.io')(srv);

io.on('connection', function(socket){
  
  var game;
  
  socket.on('set name', function(name) {
    game = findOpenGame();
    game.addPlayer(socket.id, name);
  });
  
  socket.on('roll', function() {
    game.roll(socket.id);
  });
  
  socket.on('toggle die', function(dieNum) {
    game.toggleDieSaved(socket.id, dieNum)
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
  this.names = {};
  
  // tracks players using player id (which is really just the socket id)
  this.addPlayer = function(player, name) {
    if (this.p1 && this.p2)
      return;
    if (!this.p1)
      this.p1 = player;
    else if (!this.p2)
      this.p2 = player;
    console.log("added player " + player);
    this.names[player] = name;
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
    io.to(this.p1).emit('starting game', [this.names[this.p1], this.names[this.p2]], 0);
    io.to(this.p2).emit('starting game', [this.names[this.p1], this.names[this.p2]], 1);
    this.currentPlayer = this.p1;
    this.rollData = {
      dice: [],
      saved: [false, false, false, false, false]
    };
    io.to(this.p1).emit('start turn', {p1: [], p2: [], possible: []}, this.p1 == this.currentPlayer);
    io.to(this.p2).emit('start turn', {p1: [], p2: [], possible: []}, this.p2 == this.currentPlayer);
  };
  
  this.roll = function(id) {
    if (id != this.currentPlayer)
      return;
    for (var i = 0; i < this.rollData.saved.length; i++) {
      if (!this.rollData.saved[i]) {
        this.rollData.dice[i] = rollDie();
      }
    }
    
    var dice = dataToDiceState(this.rollData);
    io.to(this.p1).emit('show dice', dice);
    io.to(this.p2).emit('show dice', dice);
  };
  
  this.addScore = function(category) {
    var scores = calculatePossibleScores(this.rollData.dice);
    var scoreCard = this.currentPlayer == this.p1 ? this.p1Score : this.p2Score;
    scoreCard[category] = scores[category];
  }
  
  this.toggleDieSaved = function(player, die) {
    if (player != this.currentPlayer)
      return;
    console.log("toggling die " + die);
    this.rollData.saved[die] = !this.rollData.saved[die];
    var dice = dataToDiceState(this.rollData);
    io.to(this.p1).emit('show dice', dice);
    io.to(this.p2).emit('show dice', dice);
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
  counts = getCounts(dice);
  var sum = 0;
  for (var i = 0; i < counts.length; i++)
    sum += counts * (i + 1);
  
  return [
    counts[0], 
    counts[1] * 2, 
    counts[2] * 3, 
    counts[3] * 4, 
    counts[4] * 5, 
    counts[5] * 6,
    hasNumOfAKind(counts, 3) ? sum : 0,
    hasNumOfAKind(counts, 4) ? sum : 0,
    fullHouseCount(counts),
    hasRunOf(dice, 4) ? 30 : 0,
    hasRunOf(dice, 5) ? 40 : 0,
    sum,
    YAHTZEE(dice)
  ];
}

// Used for counting 1-6 amounts
function getCounts(dice) {
  counts = [0, 0, 0, 0, 0, 0];
  for (var i = 0; i < dice.length; i++) {
    counts[dice[i]]++;
  }
  return counts;
}

function hasNumOfAKind(counts, amount) {
  for (var i = 0; i < counts.length; i++)
    if (counts[i] >= amount)
      return true;
  return false;
}

function fullHouseCount(counts) {
  for (var i = 0; i < counts.length; i++) {
    for (var j = 0; j < counts.length; j++) {
      if (j == i)
        continue;
      if (counts[i] == 3 && counts[j] == 2)
        return 25;
    }
  }
  return 0;
}

function hasRunOf(counts, run) {
  var count = 0;
  for (var i = 0; i < counts.length; i++) {
    if (counts[i] == 0)
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