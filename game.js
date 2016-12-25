var names;
var playerNum;

window.onload = function() {
  serverAddress = 'http://localhost:3000';
  socket = io(serverAddress);
  socket.on('connect', function() {
    $('#loading').innerHTML = "";
    $('#name').onkeydown = function(e) {
      if (e.keyCode == 13 && $('#name').value.trim().length > 0) {
        socket.emit('set name', $('#name').value.trim());
        $('#name').style.display = 'none';
        $('#gameStuff').style.display = '';
      }
    }
    
    $("#roll").onclick = function() {
      socket.emit('roll');
    }
  });
  
  socket.on('starting game', function(playerNames, myId) {
    console.log("starting game!");
    names = playerNames;
    playerNum = myId;
  });
  
  
  socket.on('start turn', startTurn);
  
  socket.on('show dice', showDice);
}

// diceState format: 
// {
//   saved: <array of {id, val}>
//   unsaved: <array of {id, val}>
// }
function showDice(diceState) {
  $("#unsavedDice").innerHTML = dieString(diceState.unsaved);
  $("#savedDice").innerHTML = dieString(diceState.saved);
  for (var i = 0; i < 5; i++) {
    var all = document.querySelectorAll(".switchDie" + i);
    console.log(all);
    for (var j = 0; j < all.length; j++) {
      all[j].onclick = function() {
        num = Number(this.className.substring(9));  // because js is fucked
        console.log("clicked die " + num);
        socket.emit('toggle die', num);
      }
    }
  }
}

function startTurn(scores, isCurrentPlayer) {
  $("#roll").disabled = !isCurrentPlayer;
  console.log(isCurrentPlayer ? "Your turn" : (names[1 - playerNum] + "'s turn"));
  var str = "";
  var i = -1;
  var p1sum1 = 0;
  var p2sum1 = 0;
  var p1total = 0;
  var p2total = 0;
  console.log(scores);
  for (var j = 0; j < 13; j++) {
    scores.p1[j] |= 0;
    scores.p2[j] |= 0;
    if (i < 6) {
      p1sum1 += scores.p1[j];
      p2sum1 += scores.p2[j];
    }
    p1total += scores.p1[j];
    p2total += scores.p2[j];
  }
  var p1bonus = p1sum1 >= 63 ? 35 : 0;
  var p2bonus = p2sum1 >= 63 ? 35 : 0;
  str += padRight('ones', 16) + "|" + padLeft(scores.p1[++i], 3) + " |" + padLeft(scores.p2[i], 3) + " |\n";
  str += padRight('twos', 16) + "|" + padLeft(scores.p1[++i], 3) + " |" + padLeft(scores.p2[i], 3) + " |\n";
  str += padRight('threes', 16) + "|" + padLeft(scores.p1[++i], 3) + " |" + padLeft(scores.p2[i], 3) + " |\n";
  str += padRight('fours', 16) + "|" + padLeft(scores.p1[++i], 3) + " |" + padLeft(scores.p2[i], 3) + " |\n";
  str += padRight('fives', 16) + "|" + padLeft(scores.p1[++i], 3) + " |" + padLeft(scores.p2[i], 3) + " |\n";
  str += padRight('sixes', 16) + "|" + padLeft(scores.p1[++i], 3) + " |" + padLeft(scores.p2[i], 3) + " |\n";
  str += "----------------+----+----+\n";
  str += padRight('SUM', 16) + "|" + padLeft(p1sum1, 3) + " |" + padLeft(p2sum1, 3) + " |\n";
  str += padRight('BONUS', 16) + "|" + padLeft(p1bonus, 3) + " |" + padLeft(p2bonus, 3) + " |\n";
  str += "----------------+----+----+\n";
  str += padRight('three of a kind', 16) + "|" + padLeft(scores.p1[++i], 3) + " |" + padLeft(scores.p2[i], 3) + " |\n";
  str += padRight('four of a kind', 16) + "|" + padLeft(scores.p1[++i], 3) + " |" + padLeft(scores.p2[i], 3) + " |\n";
  str += padRight('full house', 16) + "|" + padLeft(scores.p1[++i], 3) + " |" + padLeft(scores.p2[i], 3) + " |\n";
  str += padRight('small straight', 16) + "|" + padLeft(scores.p1[++i], 3) + " |" + padLeft(scores.p2[i], 3) + " |\n";
  str += padRight('large straight', 16) + "|" + padLeft(scores.p1[++i], 3) + " |" + padLeft(scores.p2[i], 3) + " |\n";
  str += padRight('yahtzee', 16) + "|" + padLeft(scores.p1[++i], 3) + " |" + padLeft(scores.p2[i], 3) + " |\n";
  str += padRight('chance', 16) + "|" + padLeft(scores.p1[++i], 3) + " |" + padLeft(scores.p2[i], 3) + " |\n";
  str += "----------------+----+----+\n";
  str += padRight('TOTAL', 16) + "|" + padLeft(p1total, 3) + " |" + padLeft(p2total, 3) + " |\n";;
  $("#scores").innerHTML = str;
}
function padLeft(str, len) {
  str = "" + str;
  while (str.length < len)
    str = ' ' + str;
  return str;
}
function padRight(str, len) {
  str = "" + str;
  while (str.length < len)
    str += ' ';
  return str;
}

function dieString(dice) {
  var d1 = ["   ", "  *", "*  ", "* *", "* *", "* *"];
  var d2 = [" * ", "   ", " * ", "   ", " * ", "* *"];
  var d3 = ["   ", "*  ", "  *", "* *", "* *", "* *"];
  var str1 = "";
  var str2 = "";
  var str3 = "";
  var str4 = "";
  var gap = "    ";
  for (var i = 0; i < dice.length; i++) {
    var span = "<span class=\"switchDie" + dice[i].id + "\">"
    var sspan = "</span>"
    str1 += span + "+---+" + sspan + gap;
    str2 += span + "|" + d1[dice[i].val] + "|" + sspan + gap;
    str3 += span + "|" + d2[dice[i].val] + "|" + sspan + gap;
    str4 += span + "|" + d3[dice[i].val] + "|" + sspan + gap;
  }
  return str1.trim() + "\n" + 
         str2.trim() + "\n" + 
         str3.trim() + "\n" + 
         str4.trim() + "\n" + 
         str1.trim();
}

function $(el) {
  return document.querySelector(el);
}
