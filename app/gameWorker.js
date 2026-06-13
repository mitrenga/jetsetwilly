/**/

/*/

/**/
// begin code

var controls = {
  left: false,
  right: false,
  jump: false,
  isLeft: function() {
    if (this.left && !this.right) {
      return true;
    }
    return false;
  },
  isRight: function() {
    if (this.right && !this.left) {
      return true;
    }
    return false;
  },
  isJump: function() {
    return this.jump;
  }
};

var jumpMap = [-4, -4, -3, -3, -2, -2, -1, -1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
var framesInterval = 80;

var accelerator, counter, counter2, counter4, counter6, gameData,
    standing, jumpCounter, jumpDirection, fallingCounter, fallingDirection, mustMovingDirection, shouldMovingDirection, previousDirection,
    caughtRope, caughtNode, ropeProhibited, operation, pause, loopCounter, nextLoop, ended;

/**
 * Resets all module-level game state to its initial values, ready for a new
 * room. The `controls` object is intentionally left untouched here so any held
 * keys survive a room change.
 * @returns {void}
 */
function resetData() {
  accelerator = 0;
  counter = 0;
  counter2 = 0;
  counter4 = 0;
  counter6 = 0;
  gameData = null;
  standing = [];
  jumpCounter = 0;
  jumpDirection = 0;
  fallingCounter = 0;
  fallingDirection = 0;
  mustMovingDirection = 0;
  shouldMovingDirection = 0;
  previousDirection = 0;
  caughtRope = 0;
  caughtNode = 0;
  ropeProhibited = {rope: 0, counter: 0};
  operation = 'walking';
  pause = false;
  loopCounter = 0;
  nextLoop = false;
  ended = false;
} // resetData

/**
 * Main game tick. Schedules the next frame (at normal or, in fast game state,
 * half interval) unless paused or ended, advances the frame counters, runs the
 * per-frame subsystems (conveyors, ropes, Willy, guardians, items, switches and
 * the collision checks) and posts the updated gameData back to the main thread.
 * Also drives room-transition flags via gameData.info[7].
 * @returns {void}
 */
function gameLoop() {
  loopCounter++;
  if (ended) {
    nextLoop = false;
    return;
  }
  if (!pause) {
    var framesDelay = framesInterval;
    if (gameData.info[9] == 2) {
      framesDelay = Math.floor(framesInterval/2);
    }
    nextLoop = setTimeout(gameLoop, framesDelay);
  } else {
    nextLoop = false;
  }

  // delay the first loop when switching between rooms
  if (loopCounter == 1) {
    return;
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
      if (!gameData.info[4] && gameData.info[7] === false) { // if not demo and not changing room
        isTouchingItem();
        isColliding();
        isTouchingSwitch();
      }
    }

    if (!shouldMovingDirection && standing.length && !gameData.info[5]) {
      gameData.info[12] = true;
    }

    if (gameData.info[7] == 'above') {
      jumpCounter = 0;
      jumpDirection = 0;
      postMessage({id: 'stopAudioBus', bus: 'sounds'});
    }
    gameData.info[11] = previousDirection;
    gameData.info[13] = jumpCounter;
    gameData.info[14] = jumpDirection;
    gameData.info[15] = fallingCounter;
    gameData.info[16] = fallingDirection;

    if (!ended) {
      postMessage({id: 'update', gameData: gameData});
    }
    if (gameData.info[7] !== false) {
      ended = true;
    }
  }
} // gameLoop

/**
 * Advances every conveyor's animation frame (cycles 0→3).
 * @returns {void}
 */
function conveyors() {
  gameData.conveyors.forEach((conveyor) => {
    if (conveyor.frame == 3) {
      conveyor.frame = 0;
    } else {
      conveyor.frame++;
    }  
  });
} // conveyors

/**
 * Advances every rope's swing for the current frame: updates its frame and
 * swing direction, then recomputes each node's (x, y) from the rope's relative
 * coordinate table.
 * @returns {void}
 */
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

/**
 * Dispatches Willy's per-frame update to the handler for his current
 * operation: 'walking' (willyWalking) or 'onRope' (willyOnRope).
 * @returns {void}
 */
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

/**
 * Updates Willy while walking/jumping/falling: gravity, the jump arc (jumpMap),
 * conveyor-forced movement, left/right walking (following ramps), room-edge
 * transitions (left/right/above/below via gameData.info[7]) and grabbing a rope
 * when he overlaps one. Mutates gameData.willy[0] and the movement state.
 * @returns {void}
 */
function willyWalking() {
  var willy = gameData.willy[0];

  if (jumpCounter == jumpMap.length) {
    jumpCounter = 0;
    fallingDirection = jumpDirection;
    jumpDirection = 0;
    fallingCounter = 5;
  }      

  shouldMovingDirection = 0;

  standing = isStandingOn(willy.x, willy.y, 10, 16, [gameData.walls, gameData.floors, gameData.conveyors], false);

  standing.forEach((object) => {
    if ('moving' in object) {
      switch (object.moving) {
        case 'right':
          shouldMovingDirection = 1;
          break;
        case 'left':
          shouldMovingDirection = -1;
          break;
      }
    }
  });
  
  if (!shouldMovingDirection) {
    mustMovingDirection = 0;
  }

  if (fallingCounter) {
    if (standing.length) {
      if (fallingCounter > 10) {
        gameData.info[5] = true;
      }
      fallingCounter = 0;
      if (shouldMovingDirection == fallingDirection) {
        mustMovingDirection = shouldMovingDirection;
      }
      fallingDirection = 0;
      postMessage({id: 'stopAudioBus', bus: 'sounds'});
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
          if (isStandingOn(willy.x, willy.y, 10, 16, [gameData.walls, gameData.floors, gameData.conveyors], false).length) {
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
      postMessage({id: 'playSound', bus: 'sounds', sound: 'fallingSound', options: {next: 'longFallingSound', repeat: true}});
    }
  }
  
  if (jumpCounter && jumpMap[jumpCounter] > 1) {
    if (standing.length) {
      jumpCounter = 0;
      if (shouldMovingDirection == jumpDirection) {
        mustMovingDirection = shouldMovingDirection;
      }
      jumpDirection = 0;
      postMessage({id: 'stopAudioBus', bus: 'sounds'});
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
          if (isStandingOn(willy.x, willy.y, 10, 16, [gameData.walls, gameData.floors, gameData.conveyors], false).length) {
            fall = 0;
          }
        } while (fall > 0)
      } else {
        if (willy.y+jumpMap[jumpCounter-1] < 0) {
          willy.y = 104;
          gameData.info[7] = 'above';
          gameData.info[8] = willy;
          postMessage({id: 'stopAudioBus', bus: 'sounds'});
        } else {
          willy.y += jumpMap[jumpCounter-1];
        }
      }
    } else {
      jumpCounter = 0;
      jumpDirection = 0;
      fallingCounter = 1;
      fallingDirection = 0;
      postMessage({id: 'playSound', bus: 'sounds', sound: 'fallingSound', options: {next: 'longFallingSound', repeat: true}});
    }
  }

  if (shouldMovingDirection == 1 && !controls.isLeft()) {
    mustMovingDirection = 1;
  }
  if (shouldMovingDirection == -1 && !controls.isRight()) {
    mustMovingDirection = -1;
  }

  var newDirection = 0;
  if (((gameData.info[9] == 2 || gameData.info[9] < 2 && controls.isRight()) && !jumpCounter && !fallingCounter && !mustMovingDirection && (!shouldMovingDirection || (shouldMovingDirection == -1 && previousDirection == 1))) ||
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
            postMessage({id: 'stopAudioBus', bus: 'sounds'});
          } else {
            willy.y += moveY;
          }
        }
      }
    }
  }

  if ((gameData.info[9] < 2 && controls.isLeft() && !jumpCounter && !fallingCounter && !mustMovingDirection && (!shouldMovingDirection || (shouldMovingDirection == 1 && previousDirection == -1))) ||
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
            postMessage({id: 'stopAudioBus', bus: 'sounds'});
          } else {
            willy.y += moveY;
          }
        }
      }
    }
  }

  previousDirection = newDirection;

  if (!jumpCounter && !fallingCounter && controls.isJump() && gameData.info[9] < 2) {
    if (canMove(0, jumpMap[jumpCounter])) {
      if (willy.y+jumpMap[jumpCounter] < 0) {
        willy.y = 104;
        gameData.info[7] = 'above';
        gameData.info[8] = willy;
        postMessage({id: 'stopAudioBus', bus: 'sounds'});
      } else {
        jumpCounter = 1;
        willy.y += jumpMap[jumpCounter-1];
        postMessage({id: 'playSound', bus: 'sounds', sound: 'jumpSound', options: {next: 'longFallingSound', repeat: true}});
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
            postMessage({id: 'stopAudioBus', bus: 'sounds'});
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

/**
 * Updates Willy while hanging on a rope: jumping off, or climbing along the
 * rope's nodes left/right, handling the top exit (room change above) and the
 * bottom (drop back to walking). Mutates gameData.willy[0] and rope/movement
 * state.
 * @returns {void}
 */
function willyOnRope() {
  var willy = gameData.willy[0];
  if (controls.isJump()) {
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
    postMessage({id: 'playSound', bus: 'sounds', sound: 'jumpSound', options: {next: 'longFallingSound', repeat: true}});
  } else {
    if (controls.isRight()) {
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
    if (controls.isLeft()) {
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
      postMessage({id: 'stopAudioBus', bus: 'sounds'});
    } else {
      if (gameData.ropes[caughtRope].climbBlock !== false && caughtNode < gameData.ropes[caughtRope].climbBlock-1) {
        caughtNode = gameData.ropes[caughtRope].climbBlock-1;
      }
      if (caughtNode > gameData.ropes[caughtRope].length) {
        operation = 'walking';
        fallingCounter = 1;
        willy.x = willy.x-willy.x%2;
        willy.y = willy.y+willy.x%2;
        postMessage({id: 'playSound', bus: 'sounds', sound: 'fallingSound', options: {next: 'longFallingSound', repeat: true}});
      } else {
        willy.x = gameData.ropes[caughtRope].nodes[caughtNode].x-4;
        willy.y = gameData.ropes[caughtRope].nodes[caughtNode].y-6;
      }
      willy.frame = Math.floor(willy.x%8/2);
    }
  }
} // willyOnRope

/**
 * Advances every guardian according to its `type`: horizontal and vertical
 * patrols (reversing at their limits), 'arrow' (flies across and hides
 * off-screen, with a sound cue) and 'maria' (faces Willy based on his height).
 * @returns {void}
 */
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
            if (!(counter%2)) {
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
          postMessage({id: 'playSound', bus: 'extra', sound: 'arrowSound', options: false});
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

/**
 * Advances every collectable item's animation frame (cycles 0→3).
 * @returns {void}
 */
function items() {
  gameData.items.forEach((item) => {
    if (item.frame == 3) {
      item.frame = 0;
    } else {
      item.frame++;
    }  
  });
} // items

/**
 * Advances every switch's animation frame (wrapping at its frame count).
 * @returns {void}
 */
function switches() {
  gameData.switches.forEach((switche) => {
    switche.frame++;
    if (switche.frame == switche.frames) {
      switche.frame = 0;
    }
  });    
} // switches

/**
 * Axis-aligned bounding-box overlap test of the rectangle (x, y, width, height)
 * against every non-hidden object in the given lists.
 * @param {number} x - Left edge of the test rectangle.
 * @param {number} y - Top edge of the test rectangle.
 * @param {number} width - Rectangle width.
 * @param {number} height - Rectangle height.
 * @param {Array<Array<{x:number,y:number,width:number,height:number,hide?:boolean}>>} objectsArray - Lists of objects to test against.
 * @returns {number} 1-based index of the first overlapping object within its list, or 0 if none overlap.
 */
function isTouching(x, y, width, height, objectsArray) {
  for (var a = 0; a < objectsArray.length; a++) {
    var objects = objectsArray[a];
    for (var o = 0; o < objects.length; o++) {
      var obj = objects[o];
      if (!('hide' in obj) || !obj.hide) {
        var x1 = obj.x;
        var x2 = obj.x+obj.width;
        var y1 = obj.y;
        var y2 = obj.y+obj.height;
        if (!(x+width <= x1 || y+height <= y1 || x >= x2 || y >= y2)) {
          return o+1;
        }
      }
    }
  }
  return 0;
} // isTouching

/*
 * Like isTouching, but tests full containment: returns whether the rectangle
 * (x, y, width, height) lies entirely inside a non-hidden object. Currently
 * unused (the whole function is disabled).
 * @param {number} x - Left edge of the test rectangle.
 * @param {number} y - Top edge of the test rectangle.
 * @param {number} width - Rectangle width.
 * @param {number} height - Rectangle height.
 * @param {Array<Array<{x:number,y:number,width:number,height:number,hide?:boolean}>>} objectsArray - Lists of objects to test against.
 * @returns {number} 1-based index of the first containing object within its list, or 0 if none contain it.
 *
function isInside(x, y, width, height, objectsArray) {
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
} // isInside
*/

/**
 * Finds the objects the rectangle (x, y, width, height) is resting on — those
 * it overlaps horizontally and whose top edge its bottom edge sits exactly on.
 * Returns an empty list while Willy is ascending in a jump. Unless ramps are
 * ignored, sloped ramp surfaces are also considered (via isStandingOnRamp).
 * @param {number} x - Left edge.
 * @param {number} y - Top edge.
 * @param {number} width - Rectangle width.
 * @param {number} height - Rectangle height.
 * @param {Array<Array<object>>} objectsArray - Lists of objects to test against.
 * @param {boolean} ignoreRamps - When true, ramps are not considered.
 * @returns {object[]} The objects being stood on (possibly empty).
 */
function isStandingOn(x, y, width, height, objectsArray, ignoreRamps) {
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
  return isStandingOnRamp(result, x, y, width, height);
} // isStandingOn

/**
 * Appends any ramp whose sloped surface Willy's bottom edge currently rests on
 * to the given result list, handling left and right gradients. Skipped while
 * jumping with a horizontal direction.
 * @param {object[]} result - Objects already found to be stood on; appended to.
 * @param {number} x - Left edge.
 * @param {number} y - Top edge.
 * @param {number} width - Rectangle width.
 * @param {number} height - Rectangle height.
 * @returns {object[]} The (possibly extended) result list.
 */
function isStandingOnRamp(result, x, y, width, height) {
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
} // isStandingOnRamp

/**
 * Tests whether Willy could move by (moveX, moveY) without his 10×16 body
 * entering a wall.
 * @param {number} moveX - Horizontal offset to test.
 * @param {number} moveY - Vertical offset to test.
 * @returns {boolean} True if the target position is clear.
 */
function canMove(moveX, moveY) {
  return !isTouching(gameData.willy[0].x+moveX, gameData.willy[0].y+moveY, 10, 16, [gameData.walls]);
} // canMove

/**
 * If Willy overlaps a collectable item, hides it and records its id as
 * collected; once every item in the room is collected, advances the game state
 * (gameData.info[9]).
 * @returns {void}
 */
function isTouchingItem() {
  var touchId = isTouching(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.items]);
  if (touchId) {
    gameData.items[touchId-1].hide = true;
    gameData.info[6][gameData.items[touchId-1].id] = true;
    if (Object.keys(gameData.info[6]).length == gameData.info[10]) {
      gameData.info[9] = 1;
    }
    postMessage({id: 'playSound', bus: 'extra', sound: 'itemSound', options: false});
  }
} // isTouchingItem

/**
 * Maps a sprite's logical (frame, direction) to the flat index used by
 * per-frame data such as blankMargins, matching the frame+direction layout used
 * when the sprite is drawn. Falls back to direction 0 when the object has fewer
 * directions than its current `direction`.
 * @param {{frame:number,direction:number,directions:number,frames:number}} obj - The sprite-bearing object.
 * @returns {number} The flat frame index.
 */
function collisionFrameIndex(obj) {
  var d = obj.direction;
  if (d+1 > obj.directions) {
    d = 0;
  }
  return obj.frame+d*obj.frames;
} // collisionFrameIndex

/**
 * Tests whether the local pixel (x, y) is solid according to a blank-margin
 * map. A pixel is solid when it lies inside both the row span (left/right) and
 * the column span (top/bottom), so interior holes count as solid.
 * @param {{left:number[],right:number[],top:number[],bottom:number[]}} map - Blank-margin map for one sprite frame.
 * @param {number} x - Local x within the sprite.
 * @param {number} y - Local y within the sprite.
 * @returns {boolean} True if the pixel is solid.
 */
function isMarginSolid(map, x, y) {
  var width = map.top.length;
  var height = map.left.length;
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return false;
  }
  return map.left[y] <= x && x < width-map.right[y] && map.top[x] <= y && y < height-map.bottom[x];
} // isMarginSolid

/**
 * Pixel-perfect collision test between two sprites. Broad phase: intersect
 * their paint-corrected pixel rectangles; narrow phase: scan the overlap for a
 * pixel that is solid in both sprites' blank-margin maps. Returns false if
 * either sprite has no blankMargins.
 * @param {object} a - First sprite (needs blankMargins, x, y, frame/direction).
 * @param {object} b - Second sprite (same requirements).
 * @returns {boolean} True if the sprites overlap on a mutually solid pixel.
 */
function isPixelColliding(a, b) {
  if (!a.blankMargins || !b.blankMargins) {
    return false;
  }
  var ma = a.blankMargins[collisionFrameIndex(a)];
  var mb = b.blankMargins[collisionFrameIndex(b)];
  var ba = paintCorrectedBox(a);
  var bb = paintCorrectedBox(b);
  var ax = ba.x;
  var ay = ba.y;
  var bx = bb.x;
  var by = bb.y;
  var x0 = Math.max(ax, bx);
  var y0 = Math.max(ay, by);
  var x1 = Math.min(ax+ma.top.length, bx+mb.top.length);
  var y1 = Math.min(ay+ma.left.length, by+mb.left.length);
  for (var y = y0; y < y1; y++) {
    for (var x = x0; x < x1; x++) {
      if (isMarginSolid(ma, x-ax, y-ay) && isMarginSolid(mb, x-bx, y-by)) {
        return true;
      }
    }
  }
  return false;
} // isPixelColliding

/**
 * Computes a sprite's on-screen rectangle. paintCorrections shifts the origin
 * and the renderer compensates the size, so the result matches the region the
 * sprite actually occupies (and that isPixelColliding scans). Sprites without
 * paintCorrections are treated as a zero offset.
 * @param {{x:number,y:number,width:number,height:number,paintCorrections?:{x:number,y:number}}} obj
 * @returns {{x:number,y:number,width:number,height:number}} The corrected rectangle.
 */
function paintCorrectedBox(obj) {
  var px = obj.paintCorrections ? obj.paintCorrections.x : 0;
  var py = obj.paintCorrections ? obj.paintCorrections.y : 0;
  return {x: obj.x+px, y: obj.y+py, width: obj.width-px, height: obj.height-py};
} // paintCorrectedBox

/**
 * Detects whether Willy is killed this frame: a broad-phase bounding-box test
 * against each guardian, confirmed by a pixel-perfect check, plus bounding-box
 * tests against nasties (touching or standing on). On a hit it sets the crash
 * flag (gameData.info[5]) and posts a 'crash' message.
 * @returns {void}
 */
function isColliding() {
  var willy = gameData.willy[0];
  var w = paintCorrectedBox(willy);
  for (var g = 0; g < gameData.guardians.length; g++) {
    var guardian = gameData.guardians[g];
    if (('hide' in guardian) && guardian.hide) {
      continue;
    }
    // Broad phase: paint-corrected bounding-box test; only then confirm pixel-perfect.
    if (isTouching(w.x, w.y, w.width, w.height, [[paintCorrectedBox(guardian)]]) &&
        isPixelColliding(willy, guardian)) {
      gameData.info[5] = true;
      break;
    }
  }
  if (isTouching(willy.x, willy.y, 10, 16, [gameData.nasties])) {
    gameData.info[5] = true;
  }
  if (isStandingOn(willy.x, willy.y, 10, 16, [gameData.nasties], true).length) {
    gameData.info[5] = true;
  }
  if (gameData.info[5]) {
    ended = true;
    postMessage({id: 'crash', gameData: gameData});
  }
} // isColliding

/**
 * Computes the vertical adjustment needed to follow a ramp when Willy moves
 * horizontally by `move`, so he walks up/down the slope instead of into it.
 * Only applies while grounded (not jumping). Handles left and right gradients.
 * @param {number} move - Intended horizontal move (signed).
 * @param {number} x - Left edge.
 * @param {number} y - Top edge.
 * @param {number} width - Rectangle width.
 * @param {number} height - Rectangle height.
 * @returns {number} The vertical offset to apply (0 if no ramp applies).
 */
function rampMovement(move, x, y, width, height) {
  if (!jumpCounter && !controls.jump) {
    var absMove = Math.abs(move);
    for (var o = 0; o < gameData.ramps.length; o++) {
      var obj = gameData.ramps[o];
      switch (obj.gradient) {
        case 'right':
          if ((isTouching(x+move, y-move, width+absMove, height+absMove, [[obj]])) && (y+height == obj.y+obj.height-x-width+obj.x)) {
            return -move;
          }
          break;
        case 'left':
          if ((isTouching(x+move-absMove, y+move, width+absMove, height+absMove, [[obj]])) && (y+height == obj.y+obj.height+x-obj.x-obj.width)) {
            return move;
          }
          break;
      }
    }
  }
  return 0;
} // rampMovement

/**
 * If Willy touches a switch, runs its configured actions (setValue,
 * setGameState) whose `forGameState` matches the current game state.
 * @returns {void}
 */
function isTouchingSwitch() {
  var touchId = isTouching(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.switches]);
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
} // isTouchingSwitch

/**
 * Worker message handler for commands from the main thread: 'init' (load the
 * initial data, restore Willy's carried-over movement state and start the
 * loop), 'controls' (update a control flag or predicate), 'pause', 'continue'
 * and 'reset'.
 * @param {MessageEvent} event - Message carrying a `data.id` command and payload.
 * @returns {void}
 */
onmessage = (event) => {
  switch (event.data.id) {
    case 'init':
      clearTimeout(nextLoop);
      resetData();
      gameData = {};
      Object.keys(event.data.initData).forEach((objectsType) => {
        gameData[objectsType] = [];
        if (objectsType != 'info') {
          event.data.initData[objectsType].forEach((object) => {
            gameData[objectsType].push({...object});
          });
        } else {
          gameData.info = [...event.data.initData.info];
          if (event.data.initData.willy.length) {
            previousDirection = event.data.initData.willy[0].previousDirection;
            jumpCounter = event.data.initData.willy[0].jumpCounter;
            jumpDirection = event.data.initData.willy[0].jumpDirection;
            fallingCounter = event.data.initData.willy[0].fallingCounter;
            if (fallingCounter > 2) {
              fallingCounter -= 2;
            }
            fallingDirection = event.data.initData.willy[0].fallingDirection;
          }
        }
      });
      gameLoop();
      break;

    case 'controls':
      if (event.data.action.startsWith('is')) {
        controls[event.data.action] = new Function(event.data.value);
      } else {
        controls[event.data.action] = event.data.value;
      }
      break;

    case 'pause':
      pause = true;
      break;

    case 'continue':
      clearTimeout(nextLoop);
      pause = false;
      gameLoop();
      break;
  
    case 'reset':
      clearTimeout(nextLoop);
      nextLoop = false;
      controls.left = false;
      controls.right = false;
      controls.jump = false;
      break;

  }
} // onmessage
