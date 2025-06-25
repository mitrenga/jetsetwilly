/**/

/*/

/**/
// begin code

var timer = null;
var counter = 0;

function gameLoop() {
  counter++;
} // gameLoop

timer = setInterval(gameLoop, 1000/60);  
