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
var jumpMap = [-4, -4, -3, -3, -2, -2, -1, -1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
var fallingCounter = 0;
var fallingDirection = 0;
var mustMovingDirection = 0;
var canMovingDirection = 0;
var previousDirection = 0;
var ropePosition = 31;
var operation = 1;

function gameLoop() {
  setTimeout(gameLoop, 77);

  if (gameData != null) {
    counter++;
    if (!(counter%2)) {
      counter2++;
    }
    if (!(counter%4)) {
      counter4++;
    }
    if (!(counter%6)) {
      counter6++;
    }
    conveyors();
    ropes();
    if (!gameData.info[4]) { // if not demo
      willy();
    }
    guardians();
    items();
    decorations();
    if (!gameData.info[4]) { // if not demo
      checkTouchItems();
      checkCrash();
    }
    gameData.info[0] = counter;
    gameData.info[1] = counter2;
    gameData.info[2] = counter4;
    gameData.info[3] = counter6;
  }
  postMessage({'id': 'update', 'gameData': gameData});
} // gameLoop

function conveyors() {
  gameData.conveyors.forEach((conveyor) => {
    if (conveyor.frame == 3) {
      conveyor.frame = 0;
    } else {
      conveyor.frame++;
    }  
  });
} // conveyors

function ropes() {
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
} // ropes

function willy() {
  switch (operation) {
    case 0:
      willyWalking();
      break;
    case 1:
      willyOnRope();
      break;
  }
} // willy

function willyWalking() {
  var willy = gameData.willy[0];

  if (jumpCounter == jumpMap.length) {
    jumpCounter = 0;
    fallingDirection = jumpDirection;
    jumpDirection = 0;
    fallingCounter = 1;
  }      

  canMovingDirection = 0;

  var standingOn = checkStandingWithObjectsArray(willy.x, willy.y, 10, 16, [gameData.walls, gameData.floors, gameData.conveyors]);
  var standingOnRamps = checkStandingOnRamps(willy.x, willy.y, 10, 16);
  if (standingOnRamps.length) {
    standingOn = [...standingOn, ...gameData.ramps]; 
  }

  standingOn.forEach((object) => {
    if ('moving' in object) {
      switch (object.moving) {
        case 'right':
          canMovingDirection = 1;
          break;
        case 'left':
          canMovingDirection = -1;
          break;
      }
    }
  });
  
  if (!canMovingDirection) {
    mustMovingDirection = 0;
  }

  if (fallingCounter) {
    if (standingOn.length) {
      fallingCounter = 0;
      if (canMovingDirection == fallingDirection) {
        mustMovingDirection = canMovingDirection;
      }
      fallingDirection = 0;
      postMessage({'id': 'stopChannel', 'channel': 'sounds'});
    } else {
      willy.y += 4;
      fallingCounter++;
    }
  } else {
    if (!jumpCounter && !standingOn.length) {
      fallingCounter = 1;
      fallingDirection = 0;
      postMessage({'id': 'playSound', 'channel': 'sounds', 'sound': 'fallingSound'});
    }
  }

  if (jumpCounter && jumpMap[jumpCounter] > 1) {
    if (standingOn.length) {
      jumpCounter = 0;
      if (canMovingDirection == jumpDirection) {
        mustMovingDirection = canMovingDirection;
      }
      jumpDirection = 0;
      postMessage({'id': 'stopChannel', 'channel': 'sounds'});
    }
  }

  if (jumpCounter > 0) {
    if (canMove(0, jumpMap[jumpCounter])) {
      jumpCounter++;
      willy.y += jumpMap[jumpCounter-1]; 
    } else {
      jumpCounter = 0;
      jumpDirection = 0;
      fallingCounter = 1;
      fallingDirection = 0;
      postMessage({'id': 'playSound', 'channel': 'sounds', 'sound': 'fallingSound'});
    }
  }

  if (canMovingDirection == 1 && !controls.left) {
    mustMovingDirection = 1;
  }
  if (canMovingDirection == -1 && !controls.right) {
    mustMovingDirection = -1;
  }

  var newDirection = 0;
  if ((controls.right && !controls.left && !jumpCounter && !fallingCounter && !mustMovingDirection && (!canMovingDirection || (canMovingDirection == -1 && previousDirection == 1))) ||
      (jumpCounter && jumpDirection == 1) ||
      (mustMovingDirection == 1)) {

    newDirection = 1;
    if (willy.direction == 1) {
      willy.direction = 0;
    } else {
      jumpDirection = 1;
      var moveY = rampMovement(2, willy.x, willy.y, 10, 16);
      if (canMove(2, moveY)) {
        willy.x += 2;
        willy.y += moveY;
        if (willy.frame == 3) {
          willy.frame = 0;
        } else {
          willy.frame++;
        }
      }
    }
  }

  if ((controls.left && !controls.right && !jumpCounter && !fallingCounter && !mustMovingDirection && (!canMovingDirection || (canMovingDirection == 1 && previousDirection == -1))) ||
      (jumpCounter && jumpDirection == -1) ||
      (mustMovingDirection == -1)) {

    newDirection = -1;
    if (willy.direction == 0) {
      willy.direction = 1;
    } else {
      jumpDirection = -1;
      var moveY = rampMovement(-2, willy.x, willy.y, 10, 16);
      if (canMove(-2, moveY)) {
        willy.x -= 2;
        willy.y += moveY;
        if (willy.frame == 0) {
          willy.frame = 3;
        } else {
          willy.frame--;
        }
      }
    }
  }

  previousDirection = newDirection;

  if (!jumpCounter && !fallingCounter && controls.jump) {
    if (canMove(0, jumpMap[jumpCounter])) {
      jumpCounter = 1;
      willy.y += jumpMap[jumpCounter-1];
      postMessage({'id': 'playSound', 'channel': 'sounds', 'sound': 'jumpSound'});
    }
  }

  if (!jumpCounter) {
    jumpDirection = 0;
  }
} // willyWalking

function willyOnRope() {
  var willy = gameData.willy[0];
  willy.frame = willy.direction;
  if (controls.jump) {
    operation = 0;
    jumpCounter = 1;
    jumpDirection = 0;
    if (controls.right && !controls.left) {
      jumpDirection = 1;
    }
    if (controls.left && !controls.right) {
      jumpDirection = -1;
    }
  } else {
    if (controls.right && !controls.left) {
      if (willy.direction == 1) {
        willy.direction = 0;
      } else {
        switch (gameData.ropes[0].direction) {
          case 0:
            ropePosition++;
            break;
          case 1:
            ropePosition--;
            break;
        }
      }
    }
    if (controls.left && ! controls.right) {
      if (willy.direction == 0) {
        willy.direction = 1;
      } else {
        switch (gameData.ropes[0].direction) {
          case 0:
            ropePosition--;
            break;
          case 1:
            ropePosition++;
            break;
        }
      }
    }
    if (ropePosition < 3) {
      ropePosition = 3;
    }
    if (ropePosition >= gameData.ropes[0].length) {
      operation = 0;
      fallingCounter = 1;
      willy.x = willy.x-willy.x%2;
      willy.y = willy.y+willy.x%2;
    } else {
      willy.x = gameData.ropes[ropePosition].x-4;
      willy.y = gameData.ropes[ropePosition].y-8;
    }
  }
} // willyOnRope

function guardians() {
  gameData.guardians.forEach((guardian) => {
    switch (guardian.type) {
      case 'horizontal':
        var toMove = false;
        switch (guardian.speed) {
          case 0:
            toMove = true;
            break;
          case 1:
            if (!(this.counter%2)) {
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
            if (!(counter%[0,4,2,1,1,1,1,1,1][guardian.frames])) {
              if (guardian.frame == guardian.frames-1) {
                guardian.frame = 0;
              } else {
                guardian.frame++;
              }
            }
            break;
          case 1:
            guardian.y -= guardian.speed;
            if (!(counter%[0,4,2,1,1,1,1,1,1][guardian.frames])) {
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
        if (!(counter%[0,4,2,1,1,1,1,1,1][guardian.frames])) {
          if (guardian.frame == guardian.frames-1) {
            guardian.frame = 0;
          } else {
            guardian.frame++;
          }
        }
        
        guardian.direction = 0;
        if (gameData.willy.length) {
        if (gameData.willy[0].y < 104) {
          guardian.direction = 1;
        }
        if (gameData.willy[0].y < 96) {
          guardian.direction = 2;
          }
        }
        break;        
    
    }
  });
} // guardians

function items() {
  gameData.items.forEach((item) => {
    if (item.frame == 3) {
      item.frame = 0;
    } else {
      item.frame++;
    }  
  });
} // items

function decorations() {
  gameData.decorations.forEach((decoration) => {
    if (decoration.frame == 1) {
      decoration.frame = 0;
    } else {
      decoration.frame++;
    }
  });    
} // decorations

function checkTouchWithObjectsArray(x, y, width, height, objectsArray) {
  for (var a = 0; a < objectsArray.length; a++) {
    var objects = objectsArray[a];
    for (var o = 0; o < objects.length; o++) {
      var obj = objects[o];
      if (!('hide' in obj) || !obj.hide) {
        if (!(x+width <= obj.x || y+height <= obj.y || x >= obj.x+obj.width || y >= obj.y+obj.height)) {
          return o+1;
        }
      }
    }
  }
  return 0;
} // checkTouchWithObjectsArray

function checkInsideWithObjectsArray(x, y, width, height, objectsArray) {
  for (var a = 0; a < objectsArray.length; a++) {
    var objects = objectsArray[a];
    for (var o = 0; o < objects.length; o++) {
      var obj = objects[o];
      if (!('hide' in obj) || !obj.hide) {
        if (x >= obj.x && y >= obj.y && x+width <= obj.x+obj.width && y+height <= obj.y+obj.height) {
          return o+1;
        }
      }
    }
  }
  return 0;
} // checkInsideWithObjectsArray

function checkStandingWithObjectsArray(x, y, width, height, objectsArray) {
  var result = [];

  if (jumpCounter && jumpMap[jumpCounter] < 0) {
    return result;
  }

  for (var a = 0; a < objectsArray.length; a++) {
    var objects = objectsArray[a];
    for (var o = 0; o < objects.length; o++) {
      var obj = objects[o];
      if (!('hide' in obj) || !obj.hide) {
        if (!(x+width <= obj.x || x >= obj.x+obj.width) && y+height == obj.y) {
          result.push(obj);
        }
      }
    }
  }
  return result;
} // checkStandingWithObjectsArray

function canMove(moveX, moveY) {
  return !checkTouchWithObjectsArray(gameData.willy[0].x+moveX, gameData.willy[0].y+moveY, 10, 16, [gameData.walls]);
} // canMove

function checkTouchItems() {
  var touchId = checkTouchWithObjectsArray(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.items]);
  if (touchId) {
    gameData.items[touchId-1].hide = true;
    postMessage({'id': 'playSound', 'channel': 'extra', 'sound': 'itemSound'});
  }
} // checkTouchItems

function checkCrash() {
  if (checkTouchWithObjectsArray(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.nasties, gameData.guardians])) {
    gameData.info[5] = true;
  }
  return 0;
} // checkCrash

function rampMovement(move, x, y, width, height) {
  if (!jumpCounter && !controls.jump) {
    var absMove = Math.abs(move);
    for (var o = 0; o < gameData.ramps.length; o++) {
      var obj = gameData.ramps[o];
      switch (obj.gradient) {
        case 'right':
          if ((checkTouchWithObjectsArray(x+move, y-move, width+absMove, height+absMove, [[obj]])) && (y+height == obj.y+obj.height-x-width+obj.x)) {
            return -move;
          }
          break;
        case 'left':
          if ((checkTouchWithObjectsArray(x+move-absMove, y+move, width+absMove, height+absMove, [[obj]])) && (y+height == obj.y+obj.height+x-obj.x-obj.width)) {
            return move;
          }
          break;
      }
    }
  }
  return 0;
} // rampMovement

function checkStandingOnRamps(x, y, width, height) {
  var result = [];
  for (var o = 0; o < gameData.ramps.length; o++) {
    var obj = gameData.ramps[o];
    switch (obj.gradient) {
      case 'right':
        if (y+height >= obj.y && y+height < obj.y+obj.height) {
          if (y+height == obj.y+obj.height-x-width+obj.x) {
            result.push(gameData.ramps[o+1]);
          }
        }
        break;
      case 'left':
        if (y+height >= obj.y && y+height < obj.y+obj.height) {
          if (y+height == obj.y+obj.height+x-obj.x-obj.width) {
            result.push(gameData.ramps[o+1]);
          }
        }
        break;
    }
  }
  return result;
} // checkStandingOnRamps

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
