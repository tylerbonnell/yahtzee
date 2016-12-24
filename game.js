window.onload = function() {
  serverAddress = 'http://localhost:3000';
  socket = io(serverAddress);
  socket.on('connect', function() {
    console.log("connected!");
  });
  
  socket.on('show dice', showDice);
}

// diceState format: 
// {
//   player: <string>,
//   saved: <array of {id, val}>
//   unsaved: <array of {id, val}>
// }
function showDice(diceState) {
  
}

function dieString(vals) {
  var d1 = ["   ", "  *", "*  ", "* *", "* *", "* *"];
  var d2 = [" * ", "   ", " * ", "   ", " * ", "* *"];
  var d3 = ["   ", "*  ", "  *", "* *", "* *", "* *"];
  var str1 = "";
  var str2 = "";
  var str3 = "";
  var str4 = "";
  var gap = "    ";
  for (var i = 0; i < vals.length; i++) {
    str1 += "+---+" + gap;
    str2 += d1[vals[i]] + gap;
    str3 += d2[vals[i]] + gap;
    str3 += d3[vals[i]] + gap;
  }
  return str1.trim() + "\n" + 
         str2.trim() + "\n" + 
         str3.trim() + "\n" + 
         str4.trim() + "\n" + 
         str1.trim();
}