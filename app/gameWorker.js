/**/

/*/

/**/
// begin code

var counter = 0;
var gameData = null;

function gameLoop() {
  setTimeout(gameLoop, 72);
  if (gameData != null) {
    counter++;

    // conveyors
    gameData.conveyors.forEach((conveyor) => {
      if (conveyor.frame == 3) {
        conveyor.frame = 0;
      } else {
        conveyor.frame++;
      }  
    });

    // items
    gameData.items.forEach((item) => {
      if (item.frame == 3) {
        item.frame = 0;
      } else {
        item.frame++;
      }  
    });

    // guardians
    gameData.guardians.forEach((guardian) => {
      switch (guardian.type) {
        case 'horizontal':
          var toMove = false;
          switch (guardian.speed) {
            case 0:
              toMove = true;
              break;
            case 1:
              if (this.counter%2 == 0) {
                toMove = true;
              }
              break;
          }
          if (toMove) {
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
          }
          break;

        case 'vertical':
          switch (guardian.direction) {
            case 0:
              if (guardian.y+guardian.speed > guardian.limitDown) {
                guardian.direction = 1;
              }
              break;
            case 1:
              if (guardian.y-guardian.speed < guardian.limitUp) {
                guardian.direction = 0;
              }
              break;
          }
          switch (guardian.direction) {
            case 0:
              guardian.y += guardian.speed;
              if (counter%[0,4,2,1,1,1,1,1,1][guardian.frames] == 0) {
                if (guardian.frame == guardian.frames-1) {
                  guardian.frame = 0;
                } else {
                  guardian.frame++;
                }
              }
              break;
            case 1:
              guardian.y -= guardian.speed;
              if (counter%[0,4,2,1,1,1,1,1,1][guardian.frames] == 0) {
                if (guardian.frame == 0) {
                  guardian.frame = guardian.frames-1;
                } else {
                  guardian.frame--;
                }
              }
              break;
          }
          break;        

        case 'arrow':
          switch (guardian.direction) {
            case 0:
              if (guardian.counter == guardian.maxCounter) {
                guardian.counter = guardian.minCounter;
              } else {
                guardian.counter++;
              }
              break;
            case 1:
              if (guardian.counter == guardian.minCounter) {
                guardian.counter = guardian.maxCounter;
              } else {
                guardian.counter--;
              }
              break;
          }
          var x = guardian.counter*guardian.speed;
          if (x > 255) {
            guardian.x = 0;
            guardian.hide = true;
          } else {
            guardian.x = x;
            guardian.hide = false;
          }
          break;

        case 'maria':
          guardian.direction = 0;
          if (counter%[0,4,2,1,1,1,1,1,1][guardian.frames] == 0) {
            if (guardian.frame == guardian.frames-1) {
              guardian.frame = 0;
            } else {
              guardian.frame++;
            }
          }
          
          guardian.direction = 0;
          if (gameData.willy[0].y < 104) {
            guardian.direction = 1;
          }
          if (gameData.willy[0].y < 96) {
            guardian.direction = 2;
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
