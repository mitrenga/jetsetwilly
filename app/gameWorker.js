/**/

/*/

/**/
// begin code

var timer = null;
var counter = 0;
var counter2 = 0;
var counter4 = 0;
var gameData = null;

function gameLoop() {
  if (gameData != null) {
    counter++;

    if (counter%2 == 0) {
      counter2++;
    }

    if (counter%4 == 0) {
      counter4++;

      // guardians
      gameData.guardians.forEach((guardian) => {
        switch (guardian.direction) {
          case 0:
            if (guardian.x == guardian.limitRight)
            {
              guardian.direction = 1;
            } else {
              guardian.x += 2;
              if (guardian.frame == 3) {
                guardian.frame = 0;
              } else {
                guardian.frame++;
              }
            }
            break;
          case 1:
            if (guardian.x == guardian.limitLeft)
            {
              guardian.direction = 0;
            } else {
              guardian.x -= 2;
              if (guardian.frame == 0) {
                guardian.frame = 3;
              } else {
                guardian.frame--;
              }
            }
            break;
        }
      });
    }
  }
  postMessage({'id': 'update', 'gameData': gameData});
} // gameLoop

onmessage = (event) => {
  switch (event.data.id) {
    case 'init':
      gameData = {};
      Object.keys(event.data.initData).forEach((type) => {
        gameData[type] = [];
        event.data.initData[type].forEach((object) => {
          gameData[type].push({...object});
        });
      });
      timer = setInterval(gameLoop, 1000/60);  
      break;
  }
} // onmessage
