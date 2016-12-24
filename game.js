window.onload = function() {
  // testing basic functionality
  var x = [0, 0, 0, 0, 0, 0];
  for (var i = 0; i < 1000; i++) {
    x[rollDie()]++;
  }
  console.log(x);
  for (var i = 0; i < 6; i++) {
    console.log(dieString(i));
  }
}

// Generate a number [0, 5]
function rollDie() {
  return Math.floor(Math.random() * 6);
}

function dieString(val) {
  var d1 = ["   ", "  *", "*  ", "* *", "* *", "* *"];
  var d2 = [" * ", "   ", " * ", "   ", " * ", "* *"];
  var d3 = ["   ", "*  ", "  *", "* *", "* *", "* *"];
  return "+---+\n|" + d1[val] + "|\n|" + d2[val] + "|\n|" + d3[val] + "|\n+---+";
}