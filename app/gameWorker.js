/**/

/*/

/**/
// begin code

var accelerator = 0;
var counter = 0;
var counter2 = 0;
var counter4 = 0;
var counter6 = 0;
var gameData = null;
var controls = {left: false, right: false, jump: false};
var standing = [];
var jumpCounter = 0;
var jumpDirection = 0;
var jumpMap = [-4, -4, -3, -3, -2, -2, -1, -1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
var fallingCounter = 0;
var fallingDirection = 0;
var mustMovingDirection = 0;
var canMovingDirection = 0;
var previousDirection = 0;
var caughtRope = 0;
var caughtNode = 0;
var ropeProhibited = {rope: 0, counter: 0};
var operation = 'walking';
var pause = false;

function gameLoop() {
  if (!pause) {
    var delay = 77;
    if (gameData.info[9] == 2) {
      delay = 38;
    }
    setTimeout(gameLoop, delay);
  }

  if (gameData != null) {
    accelerator++;
    if (accelerator == 2) {
      accelerator = 0;
    }
    if (gameData.info[9] != 2 || accelerator == 1) {
      counter++;
      gameData.info[0] = counter;
      if (!(counter%2)) {
        counter2++;
      }
      gameData.info[1] = counter2;
      if (!(counter%4)) {
        counter4++;
      }
      gameData.info[2] = counter4;
      if (!(counter%6)) {
        counter6++;
      }
      gameData.info[3] = counter6;
      conveyors();
      ropes();
    }
    if (!gameData.info[4]) { // if not demo
      willy();
    }
    if (gameData.info[9] != 2 || accelerator == 1) {
      guardians();
      items();
      switches();
      if (!gameData.info[4]) { // if not demo
        checkTouchItems();
        checkCrash();
        checkTouchSwitches();
      }
    }

    if (!mustMovingDirection && standing.length && !gameData.info[5]) {
      gameData.info[12] = true;
    }

    gameData.info[11] = previousDirection;
    postMessage({id: 'update', gameData: gameData});
  }
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
  gameData.ropes.forEach((rope, r) => {

    // update frame & direction
    var direction = -(rope.direction*2-1);
    if (Math.abs(rope.frame) >= rope.frames-1 && rope.prevDirection == rope.direction) {
      rope.prevDirection = rope.direction;
      rope.direction = Math.abs(rope.direction-1);
      direction *= -1;
    } else {
      rope.prevDirection = rope.direction;
      rope.frame += 2*Math.sign(direction);
      if (Math.abs(rope.frame) < 20) {
        rope.frame += 2*Math.sign(direction);
      }
    }

    // calc nodes coordinates
    var x = rope.nodes[0].x;
    var y = rope.nodes[0].y;
    var ptr = Math.abs(rope.frame);
    for (var node = 1; node < rope.nodes.length; node++) {
      x += rope.relativeCoordinates[0][ptr]*Math.sign(rope.frame);
      y += rope.relativeCoordinates[1][ptr];
      rope.nodes[node].x = x;
      rope.nodes[node].y = y;
      ptr++;
    }
  });
} // ropes

function willy() {
  switch (operation) {
    case 'walking':
      willyWalking();
      break;
    case 'onRope':
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
    fallingCounter = 5;
  }      

  canMovingDirection = 0;

  standing = checkStandingWithObjectsArray(willy.x, willy.y, 10, 16, [gameData.walls, gameData.floors, gameData.conveyors], false);

  standing.forEach((object) => {
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
    if (standing.length) {
      if (fallingCounter > 9) {
        gameData.info[5] = true;
      }
      fallingCounter = 0;
      if (canMovingDirection == fallingDirection) {
        mustMovingDirection = canMovingDirection;
      }
      fallingDirection = 0;
      postMessage({id: 'stopAudioChannel', channel: 'sounds'});
    } else {
      var fall = 4;
      do {
        if (willy.y == 112) {
          willy.y = 0;
          gameData.info[7] = 'below';
          gameData.info[8] = willy;
          fall = 0;
        } else {
          willy.y += 1;
          fall--;
          if (checkStandingWithObjectsArray(willy.x, willy.y, 10, 16, [gameData.walls, gameData.floors, gameData.conveyors], false).length) {
            fall = 0;
          }
        }
      } while (fall > 0)
      fallingCounter++;
    }
  } else {
    if (!jumpCounter && !standing.length) {
      fallingCounter = 1;
      fallingDirection = 0;
      postMessage({id: 'playSound', channel: 'sounds', sound: 'fallingSound'});
    }
  }
  
  if (jumpCounter && jumpMap[jumpCounter] > 1) {
    if (standing.length) {
      jumpCounter = 0;
      if (canMovingDirection == jumpDirection) {
        mustMovingDirection = canMovingDirection;
      }
      jumpDirection = 0;
      postMessage({id: 'stopAudioChannel', channel: 'sounds'});
    }
  }

  if (jumpCounter > 0) {
    if (canMove(0, jumpMap[jumpCounter])) {
      jumpCounter++;
      if (jumpMap[jumpCounter-1] > 0) {
        var fall = jumpMap[jumpCounter-1];
        do {
          willy.y += 1;
          fall--;
          if (checkStandingWithObjectsArray(willy.x, willy.y, 10, 16, [gameData.walls, gameData.floors, gameData.conveyors], false).length) {
            fall = 0;
          }
        } while (fall > 0)
      } else {
        if (willy.y+jumpMap[jumpCounter-1] < 0) {
          willy.y = 104;
          gameData.info[7] = 'above';
          gameData.info[8] = willy;
        } else {
          willy.y += jumpMap[jumpCounter-1];
        }
      }
    } else {
      jumpCounter = 0;
      jumpDirection = 0;
      fallingCounter = 1;
      fallingDirection = 0;
      postMessage({id: 'playSound', channel: 'sounds', sound: 'fallingSound'});
    }
  }

  if (canMovingDirection == 1 && !controls.left) {
    mustMovingDirection = 1;
  }
  if (canMovingDirection == -1 && !controls.right) {
    mustMovingDirection = -1;
  }

  var newDirection = 0;
  if (((gameData.info[9] == 2 || gameData.info[9] < 2 && controls.right && !controls.left ) && !jumpCounter && !fallingCounter && !mustMovingDirection && (!canMovingDirection || (canMovingDirection == -1 && previousDirection == 1))) ||
      (jumpCounter && jumpDirection == 1) ||
      (mustMovingDirection == 1)) {

    newDirection = 1;
    if (willy.direction == 1) {
      willy.direction = 0;
    } else {
      jumpDirection = 1;
      var moveY = rampMovement(2, willy.x, willy.y, 10, 16);
      if (canMove(2, moveY)) {
        if (willy.x == 246) {
          willy.x = 6;
          gameData.info[7] = 'right';
          gameData.info[8] = willy;
        } else {
          willy.x += 2;
          if (willy.frame == 3) {
            willy.frame = 0;
          } else {
            willy.frame++;
          }
          if (willy.y+moveY < 0) {
            willy.y = 104;
            gameData.info[7] = 'above';
            gameData.info[8] = willy;
          } else {
            willy.y += moveY;
          }
        }
      }
    }
  }

  if ((gameData.info[9] < 2 && controls.left && !controls.right && !jumpCounter && !fallingCounter && !mustMovingDirection && (!canMovingDirection || (canMovingDirection == 1 && previousDirection == -1))) ||
      (jumpCounter && jumpDirection == -1) ||
      (mustMovingDirection == -1)) {

    newDirection = -1;
    if (willy.direction == 0) {
      willy.direction = 1;
    } else {
      jumpDirection = -1;
      var moveY = rampMovement(-2, willy.x, willy.y, 10, 16);
      if (canMove(-2, moveY)) {
        if (willy.x == 0) {
          willy.x = 240;
          gameData.info[7] = 'left';
          gameData.info[8] = willy;
        } else {
          willy.x -= 2;
          if (willy.frame == 0) {
            willy.frame = 3;
          } else {
            willy.frame--;
          }
          if (willy.y+moveY < 0) {
            willy.y = 104;
            gameData.info[7] = 'above';
            gameData.info[8] = willy;
          } else {
            willy.y += moveY;
          }
        }
      }
    }
  }

  previousDirection = newDirection;

  if (!jumpCounter && !fallingCounter && controls.jump && gameData.info[9] < 2) {
    if (canMove(0, jumpMap[jumpCounter])) {
      if (willy.y+jumpMap[jumpCounter] < 0) {
        willy.y = 104;
        gameData.info[7] = 'above';
        gameData.info[8] = willy;
      } else {
        jumpCounter = 1;
        willy.y += jumpMap[jumpCounter-1];
        postMessage({id: 'playSound', channel: 'sounds', sound: 'jumpSound'});
      }
    }
  }

  if (!jumpCounter) {
    jumpDirection = 0;
  }

  if ('ropes' in gameData && operation != 'onRope') {
    gameData.ropes.forEach((rope, r) => {
      if (!ropeProhibited.counter || ropeProhibited.rope != r) {
        var n = rope.nodes.length-1;
        while (n > 2) {
          var node = rope.nodes[n];
          if (!(node.x+1 < willy.x+2 || node.x > willy.x+6 || node.y+1 < willy.y+6 || node.y > willy.y+10)) {
            gameData.info[12] = true;
            operation = 'onRope';
            caughtRope = r;
            caughtNode = n;
            jumpCounter = 0;
            fallingCounter = 0;
            postMessage({id: 'stopAudioChannel', channel: 'sounds'});
          }
          n--;
        }
      }
    });
  }

  if (ropeProhibited.counter > 0) {
    ropeProhibited.counter--;
  }
} // willyWalking

function willyOnRope() {
  var willy = gameData.willy[0];
  if (controls.jump) {
    operation = 'walking';
    jumpCounter = 1;
    switch (willy.direction) {
      case 0:
        jumpDirection = 1;
        break;
      case 1:
        jumpDirection = -1;
        break;
    }
    ropeProhibited.rope = caughtRope;
    ropeProhibited.counter = 4;
    willy.x = willy.x-willy.x%2+4*jumpDirection;
    willy.y = willy.y+willy.x%2-2;
    willy.frame = Math.floor(willy.x%8/2);
    postMessage({id: 'playSound', channel: 'sounds', sound: 'jumpSound'});
  } else {
    if (controls.right && !controls.left) {
      if (willy.direction == 1) {
        willy.direction = 0;
      } else {
        switch (gameData.ropes[caughtRope].direction) {
          case 0:
            caughtNode++;
            break;
          case 1:
            caughtNode--;
            break;
        }
      }
    }
    if (controls.left && ! controls.right) {
      if (willy.direction == 0) {
        willy.direction = 1;
      } else {
        switch (gameData.ropes[caughtRope].direction) {
          case 0:
            caughtNode--;
            break;
          case 1:
            caughtNode++;
            break;
        }
      }
    }
    if (caughtNode < 3) {
      willy.x = willy.x-willy.x%2;
      willy.y = 104;
      gameData.info[7] = 'above';
      gameData.info[8] = willy;
    } else {
      if (gameData.ropes[caughtRope].climbBlock !== false && caughtNode < gameData.ropes[caughtRope].climbBlock-1) {
        caughtNode = gameData.ropes[caughtRope].climbBlock-1;
      }
      if (caughtNode > gameData.ropes[caughtRope].length) {
        operation = 'walking';
        fallingCounter = 1;
        willy.x = willy.x-willy.x%2;
        willy.y = willy.y+willy.x%2;
        postMessage({id: 'playSound', channel: 'sounds', sound: 'fallingSound'});
      } else {
        willy.x = gameData.ropes[caughtRope].nodes[caughtNode].x-4;
        willy.y = gameData.ropes[caughtRope].nodes[caughtNode].y-6;
      }
      willy.frame = Math.floor(willy.x%8/2);
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
        if (guardian.counter == guardian.soundWhenCounter) {
          postMessage({id: 'playSound', channel: 'extra', sound: 'arrowSound'});
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

function switches() {
  gameData.switches.forEach((switche) => {
    switche.frame++;
    if (switche.frame == switche.frames) {
      switche.frame = 0;
    }
  });    
} // switches

function checkTouchWithObjectsArray(x, y, width, height, objectsArray) {
  for (var a = 0; a < objectsArray.length; a++) {
    var objects = objectsArray[a];
    for (var o = 0; o < objects.length; o++) {
      var obj = objects[o];
      if (!('hide' in obj) || !obj.hide) {
        var d = obj.direction;
        if (d+1 > obj.directions) {
          d = 0;
        }
        var f = obj.frame+d*obj.frames;
        var x1 = obj.x;
        var x2 = obj.x+obj.width;
        var y1 = obj.y;
        var y2 = obj.y+obj.height;
        if ('touchCorrections' in obj) {
          if ('x1' in obj.touchCorrections[f]) {
            x1 += obj.touchCorrections[f].x1;
          }
          if ('y1' in obj.touchCorrections[f]) {
            y1 += obj.touchCorrections[f].y1;
          }
          if ('x2' in obj.touchCorrections[f]) {
            x2 = obj.x+obj.touchCorrections[f].x2;
          }
          if ('y2' in obj.touchCorrections[f]) {
            y2 = obj.y+obj.touchCorrections[f].y2;
          }
        }
        if (!(x+width <= x1 || y+height <= y1 || x >= x2 || y >= y2)) {
          return o+1;
        }
      }
    }
  }
  return 0;
} // checkTouchWithObjectsArray

/*
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
*/

function checkStandingWithObjectsArray(x, y, width, height, objectsArray, ignoreRamps) {
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
  if (ignoreRamps) {
    return result;
  }
  return checkStandingOnRamps(result, x, y, width, height);
} // checkStandingWithObjectsArray

function checkStandingOnRamps(result, x, y, width, height) {
  if (!jumpCounter || !jumpDirection) {
    for (var o = 0; o < gameData.ramps.length; o++) {
      var obj = gameData.ramps[o];
      switch (obj.gradient) {
        case 'right':
          if (y+height >= obj.y && y+height < obj.y+obj.height) {
            if (y+height == obj.y+obj.height-x-width+obj.x) {
              result.push(gameData.ramps[o]);
            }
          }
          break;
        case 'left':
          if (y+height >= obj.y && y+height < obj.y+obj.height) {
            if (y+height == obj.y+obj.height+x-obj.x-obj.width) {
              result.push(gameData.ramps[o]);
            }
          }
          break;
      }
    }
  }
  return result;
} // checkStandingOnRamps

function canMove(moveX, moveY) {
  return !checkTouchWithObjectsArray(gameData.willy[0].x+moveX, gameData.willy[0].y+moveY, 10, 16, [gameData.walls]);
} // canMove

function checkTouchItems() {
  var touchId = checkTouchWithObjectsArray(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.items]);
  if (touchId) {
    gameData.items[touchId-1].hide = true;
    gameData.info[6][gameData.items[touchId-1].id] = true;
    if (Object.keys(gameData.info[6]).length == gameData.info[10]) {
      gameData.info[9] = 1;
    }
    postMessage({id: 'playSound', channel: 'extra', sound: 'itemSound'});
  }
} // checkTouchItems

function checkCrash() {
  var willy = gameData.willy[0];
  var f = willy.frame+willy.direction*willy.frames;
  if (checkTouchWithObjectsArray(willy.x+willy.touchCorrections[f].x1, willy.y, willy.touchCorrections[f].x2-willy.touchCorrections[f].x1, 16, [gameData.guardians])) {
    gameData.info[5] = true;
  }
  if (checkTouchWithObjectsArray(willy.x, willy.y, 10, 16, [gameData.nasties])) {
    gameData.info[5] = true;
  }
  if (checkStandingWithObjectsArray(willy.x, willy.y, 10, 16, [gameData.nasties], true).length) {
    gameData.info[5] = true;
  }
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

function checkTouchSwitches() {
  var touchId = checkTouchWithObjectsArray(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.switches]);
  if (touchId) {
    var actions = gameData.switches[touchId-1].actions;
    actions.forEach((action) => {
      if (!('forGameState' in action) || action.forGameState == gameData.info[9]) {
        switch(action.type) {
          case 'setValue':
            gameData[action.objectsArray][action.index][action.variable] = action.value;
            break;
          case 'setGameState':
            gameData.info[9] = action.value;
            break;
        }
      }
    });
  }
} // checkTouchSwitches

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
          previousDirection = event.data.previousDirection;
        }
      });
      gameLoop();
      break;

    case 'controls':
      controls[event.data.action] = event.data.value;
      break;

    case 'pause':
      this.pause = true;
      break;

    case 'continue':
      this.pause = false;
      gameLoop();
      break;

    }
} // onmessage
