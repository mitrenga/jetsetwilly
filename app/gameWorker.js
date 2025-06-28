/**/

/*/

/**/
// begin code

var counter = 0;
var counter2 = 0;
var counter4 = 0;
var gameData = null;

function gameLoop() {
  setTimeout(gameLoop, 18);
  if (gameData != null) {
    counter++;

    if (counter%2 == 0) {
      counter2++;
    }

    if (counter%4 == 0) {
      counter4++;

      // conveyors
      gameData.conveyors.forEach((conveyor) => {
        if (conveyor.frame == 3) {
          conveyor.frame = 0;
        } else {
          conveyor.frame++;
        }  
      });

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

      // decorations
      gameData.decorations.forEach((decoration) => {
        if (decoration.frame == 1) {
          decoration.frame = 0;
        } else {
          decoration.frame++;
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
      gameLoop();
      break;
  }
} // onmessage
