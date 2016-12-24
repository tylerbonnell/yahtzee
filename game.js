window.onload = function() {
  serverAddress = 'http://localhost:3000';
  socket = io(serverAddress);
  socket.on('connect', function() {
    console.log("connected!");
  });
  
  for (var i = 0; i < 6; i++) {
    console.log(dieString(i));
  }
}

function dieString(val) {
  var d1 = ["   ", "  *", "*  ", "* *", "* *", "* *"];
  var d2 = [" * ", "   ", " * ", "   ", " * ", "* *"];
  var d3 = ["   ", "*  ", "  *", "* *", "* *", "* *"];
  return "+---+\n|" + d1[val] + "|\n|" + d2[val] + "|\n|" + d3[val] + "|\n+---+";
}