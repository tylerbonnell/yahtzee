var srv = require('http').Server();
var io = require('socket.io')(srv);

io.on('connection', function(socket){
  socket.emit('hi');
  
  socket.on('join game', function() {
    var game = findOpenGame();
    game.addPlayer(socket.id);
  });
  
  socket.on('restart', function() {
    if (playerToGameMap[socket.id])
      playerToGameMap[socket.id].restart();
  })
  
  socket.on('disconnect', function() {
    if(playerToGameMap[socket.id])
      playerToGameMap[socket.id].removePlayer(socket.id);
  });
});


var games = [];
var playerToGameMap = {};
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
      p1 = player;
    else if (!this.p2)
      p2 = player;
    playerToGameMap[player] = this;
    if (this.p1 && this.p2)
      this.startGame();
  }
  
  this.removePlayer = function(player) {
    var p = null;
    if (p1 == player)
      p1 = null;
    else if (p2 == player)
      p2 = null;
    else
      return;
    
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