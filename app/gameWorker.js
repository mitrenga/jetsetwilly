/**/

/*/

/**/
// begin code

var counter = 0;
var counter2 = 0;
var counter4 = 0;
var counter6 = 0;
var gameData = null;
var ropeRelativeCoordinates = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,1,1,2,1,1,2,2,3,2,3,2,3,3,3,3,3,3],
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,3,3,2,3,2,3,2,3,2,2,2,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
];
var controls = {'left': false, 'right': false, 'jump': false};
var jumpCounter = 0;
var jumpDirection = 0;
var jumpMap = [0, -4, -4, -3, -3, -2, -2, -1, -1, 0, 1, 1, 2, 2, 3, 3, 4, 4];

function gameLoop() {
  setTimeout(gameLoop, 77);

  if (gameData != null) {
    counter++;
    if (counter%2 == 0) {
      counter2++;
    }
    if (counter%4 == 0) {
      counter4++;
    }
    if (counter%6 == 0) {
      counter6++;
    }

    // conveyors
    gameData.conveyors.forEach((conveyor) => {
      if (conveyor.frame == 3) {
        conveyor.frame = 0;
      } else {
        conveyor.frame++;
      }  
    });

    //rope
    if (gameData.ropes.length > 0) {
      var firstElement = gameData.ropes[0];
      switch (firstElement.direction) {
        case 0:
          if (firstElement.frame == firstElement.frames-1) {
            firstElement.direction = 1;
          } else {
            firstElement.frame += 2;
            if (firstElement.frame > -20 && firstElement.frame < 20) {
              firstElement.frame += 2;
            }
          }
          break;
        case 1:
          if (firstElement.frame == 1-firstElement.frames) {
            firstElement.direction = 0;
          } else {
            firstElement.frame -= 2;
            if (firstElement.frame > -20 && firstElement.frame < 20) {
              firstElement.frame -= 2;
            }
          }
          break;
      }
      var x = firstElement.x;
      var y = firstElement.y;
      var ptr = Math.abs(firstElement.frame);
      for (var r = 1; r < gameData.ropes.length; r++) {
        if (firstElement.frame < 0) {
          x -= ropeRelativeCoordinates[0][ptr];
        } else {
          x += ropeRelativeCoordinates[0][ptr];
        }
        y += ropeRelativeCoordinates[1][ptr];
        gameData.ropes[r].x = x;
        gameData.ropes[r].y = y;
        ptr++;
      }
    }

    // Willy
    var moveDirection = 0;
    if (jumpCounter == jumpMap.length-1) {
      jumpCounter = 0;
      jumpDirection = 0;
    }
    if ((controls.right && !controls.left && jumpCounter == 0) || (jumpCounter > 0 && jumpDirection == 1)) {
      if (gameData.willy[0].direction == 1) {
        gameData.willy[0].direction = 0;
      } else if (canGoRight(2)) {
        moveDirection = 1;
        gameData.willy[0].x += 2;
        if (gameData.willy[0].frame == 3) {
          gameData.willy[0].frame = 0;
        } else {
          gameData.willy[0].frame++;
        }
      }
    }
    if ((controls.left && !controls.right && jumpCounter == 0) || (jumpCounter > 0 && jumpDirection == -1)) {
      if (gameData.willy[0].direction == 0) {
        gameData.willy[0].direction = 1;
      } else if (canGoLeft(2)) {
        moveDirection = -1;
        gameData.willy[0].x -= 2;
        if (gameData.willy[0].frame == 0) {
          gameData.willy[0].frame = 3;
        } else {
          gameData.willy[0].frame--;
        }
      }
    }
    if (jumpCounter > 0) {
      jumpCounter++;
      gameData.willy[0].y += jumpMap[jumpCounter]; 
    }
    else if (controls.jump) {
      jumpCounter++;
      jumpDirection = moveDirection;
      gameData.willy[0].y += jumpMap[jumpCounter]; 
      postMessage({'id': 'playSound', 'channel': 'sounds', 'sound': 'jumpSound'});
    }

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

    // items
    gameData.items.forEach((item) => {
      if (item.frame == 3) {
        item.frame = 0;
      } else {
        item.frame++;
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

    // game counters
    gameData.info[0] = counter;
    gameData.info[1] = counter2;
    gameData.info[2] = counter4;
    gameData.info[3] = counter6;
  }

  postMessage({'id': 'update', 'gameData': gameData});
} // gameLoop

function checkTouchWithObjectsArray(x, y, width, height, objects) {
  for (var o = 0; o < objects.length; o++) {
    var obj = objects[o];
    if (!(x+width <= obj.x || y+height <= obj.y || x >= obj.x+obj.width || y >= obj.y+obj.height)) {
      return true;
    }
  }
  return false;
} // checkTouchWithObjectsArray

function canGoRight(step) {
  return !checkTouchWithObjectsArray(gameData.willy[0].x+step, gameData.willy[0].y, 10, 16, gameData.walls);
} // canGoRight

function canGoLeft(step) {
  return !checkTouchWithObjectsArray(gameData.willy[0].x-step, gameData.willy[0].y, 10, 16, gameData.walls);
} // canGoLeft

onmessage = (event) => {
  switch (event.data.id) {
    case 'init':
      gameData = {};
      Object.keys(event.data.initData).forEach((objectsType) => {
        gameData[objectsType] = [];
        if (objectsType != 'info') {
          event.data.initData[objectsType].forEach((object) => {
            gameData[objectsType].push({...object});
          });
        } else {
          gameData.info = [...event.data.initData.info];
        }
      });
      gameLoop();
      break;

    case 'controls':
      controls[event.data.action] = event.data.value;
      break;

    }
} // onmessage
