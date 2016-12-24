var srv = require('http').Server();
var io = require('socket.io')(srv);

io.on('connection', function(socket){
  socket.emit('hi');
  
  var game = findOpenGame();
  game.addPlayer(socket.id);
  
  socket.on('roll', function() {
  });
  
  socket.on('save die', function(dieNum) {
  });
  
  socket.on('unsave die', function(dieNum) {
  });
  
  socket.on('restart', function() {
    game.restart();
  });
  
  socket.on('disconnect', function() {
    game.removePlayer(socket.id);
  });
});


var games = [];
function findOpenGame() {
  for (var i = 0; i < games.length + 1; i++) {
    var g = games[i];
    if (!g)
      games[i] = new Game();
    // not a full game
    if (!g.p1 || !g.p2)
      return games[i];
  }
}


function Game() {
  this.p1 = null;
  this.p2 = null;
  
  // tracks players using player id (which is really just the socket id)
  this.addPlayer = function(player) {
    if (this.p1 && this.p2)
      return;
    if (!this.p1)
      this.p1 = player;
    else if (!this.p2)
      this.p2 = player;
    if (this.p1 && this.p2)
      this.startGame();
  }
  
  this.removePlayer = function(player) {
    if (this.p1 == player)
      this.p1 = null;
    else if (this.p2 == player)
      this.p2 = null;
    else
      return;
    this.currentPlayer = this.p1 || this.p2;
  }
  
  this.startGame = function() {
    
  }
  
  this.restart = function() {
    
  }
}

// Generate a number [0, 5]
function rollDie() {
  return Math.floor(Math.random() * 6);
}

srv.listen(3000, function(){
  console.log('listening on *:3000');
});