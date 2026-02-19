/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { BorderEntity } = await import('./borderEntity.js?ver='+window.srcVersion);
const { GameAreaEntity } = await import('./gameAreaEntity.js?ver='+window.srcVersion);
const { GameInfoEntity } = await import('./gameInfoEntity.js?ver='+window.srcVersion);
const { PauseGameEntity } = await import('./pauseGameEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import BorderEntity from './borderEntity.js';
import GameAreaEntity from './gameAreaEntity.js';
import GameInfoEntity from './gameInfoEntity.js';
import PauseGameEntity from './pauseGameEntity.js';
/**/
// begin code

export class RoomModel extends AbstractModel {
  
  constructor(app, roomNumber, demo) {
    super(app);
    this.id = 'RoomModel';

    this.roomNumber = roomNumber;
    this.adjoiningRoom = {left:0, right:0, above:0, below:0};
    this.demo = demo;
    this.bkAnimation = false;
    this.animationTime = false;
    this.animationType = false;
    this.autorepeatKeys = false;
    this.needDraw = true;
    this.safeInitPosition = false;

    this.initData = {
      info: [
        0, // counter   [0]
        0, // counter2  [1]
        0, // counter4  [2]
        0, // counter6  [3]
        demo, //        [4]
        false, // crash [5]
        this.app.itemsCollected, // [6]
        false, // adjoining room    [7]
        false, // Willy data        [8]
        this.app.gameState, //      [9] 
        Object.keys(this.app.globalData.items).length, // total items [10]
        0, // prevDirection          [11]
        false, // safe init position [12]
        0, // jumpCounter            [13]
        0, // jumpDirection          [14]
        0, // fallingCounter         [15]
        0  // fallingDirection       [16]
      ]
    };

    this.worker = new Worker(this.app.importPath+'/gameWorker.js?ver='+window.srcVersion);
    this.worker.onmessage = (event) => {

      if (this.demo && event.data.id == 'update' && event.data.gameData.info[0] == 80) {
        this.sendEvent(1, {id: 'animationDemoRoomDone'});
        return;
      }

      switch (event.data.id) {
        case 'update':
          if (this.bkAnimation !== false) {
            this.gameAreaEntity.bkColor = this.app.platform.color(this.bkAnimation);
            if (this.bkAnimation >= 0) {
              this.bkAnimation--;
            } else {
              this.bkAnimation = false;
            }
            if (this.bkAnimation < 0) {
              this.gameAreaEntity.restoreBkColor();
              this.bkAnimation = false;
            }
          }
          Object.keys(event.data.gameData).forEach((objectsType) => {
            switch (objectsType) {
              case 'info':
                this.app.gameState = event.data.gameData.info[9];
                if (!this.safeInitPosition && event.data.gameData.info[12]) {
                  this.safeInitPosition = true;
                  this.app.willySafeInitPositionCache = {...this.app.willyRoomsCache};
                  this.app.willySafeInitPositionCache.roomNumber = this.roomNumber;
                }
                if (event.data.gameData.info[7] !== false) {
                  this.app.timeCounter += event.data.gameData.info[0];
                  this.sendEvent(
                    1,
                    {
                      id: 'changeRoom',
                      adjoiningRoom: this.adjoiningRoom[event.data.gameData.info[7]],
                      willyData: event.data.gameData.info[8],
                      previousDirection: event.data.gameData.info[11],
                      jumpCounter: event.data.gameData.info[13],
                      jumpDirection: event.data.gameData.info[14],
                      fallingCounter: event.data.gameData.info[15],
                      fallingDirection: event.data.gameData.info[16]
                    }
                  );
                }
                for (var l = 0; l < this.app.lives; l++) {
                  this.gameInfoEntity.liveEntities[l].x = event.data.gameData.info[3]%4*2+l*16;
                  this.gameInfoEntity.liveEntities[l].frame = event.data.gameData.info[3]%4;
                }
                var hour = 7+Math.floor((this.app.timeCounter+event.data.gameData.info[0])/15360);
                var minute = Math.floor((this.app.timeCounter+event.data.gameData.info[0])%15360/256);
                var hour12 = hour%12;
                if (hour12 == 0) {
                  hour12 = 12;
                }
                this.app.timeStr = hour12.toString().padStart(2, ' ')+':'+minute.toString().padStart(2, '0');
                if (hour > 11) {
                  this.app.timeStr = this.app.timeStr+'pm';
                } else {
                  this.app.timeStr = this.app.timeStr+'am';
                }
                this.gameInfoEntity.timeEntity.setText(this.app.timeStr);
                if (hour > 23) {
                  this.sendEvent(1, {id: 'gameOver'});
                }
                if (event.data.gameData.info[5]) {
                  this.app.timeCounter += event.data.gameData.info[0]; 
                  this.sendEvent(1, {id: 'crash'});
                }
                if (this.app.itemsCollected != event.data.gameData.info[6]) {
                  this.app.itemsCollected = event.data.gameData.info[6];
                  if (this.app.extraGame) {
                    this.gameInfoEntity.itemsCollectedEntity.setText((this.app.totalItems-Object.keys(this.app.itemsCollected).length).toString().padStart(3, '0'));
                  } else {
                    this.gameInfoEntity.itemsCollectedEntity.setText(Object.keys(this.app.itemsCollected).length.toString().padStart(3, '0'));
                  }
                }
                break;
                
              case 'floors':
              case 'walls':
              case 'nasties':
              case 'ramps':
                break;

              case 'ropes':
                this.gameAreaEntity.updateData(event.data.gameData, 'ropes', 'nodes');
                break;

              default:
                this.gameAreaEntity.updateData(event.data.gameData, objectsType, false);
            }
          });
          this.drawModel();
          this.needDraw = false;
          break;

        case 'playSound':
          this.sendEvent(0, {id: 'playSound', channel: event.data.channel, sound: event.data.sound, options: event.data.options});
          break;

        case 'stopAudioChannel':
          this.sendEvent(0, {id: 'stopAudioChannel', channel: event.data.channel});
          break;
      }
    } // onmessage

  } // constructor

  postWorkerMessage(message) {
    if (this.worker) {
      this.worker.postMessage(message);
    }
  } // postWorkerMessage

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('black');
    this.desktopEntity.bkColor = this.app.platform.colorByName('black');
    this.gameAreaEntity = new GameAreaEntity(this.desktopEntity, 0, 0, 32*8, 16*8, this.roomNumber, this.initData, this.demo);
    this.desktopEntity.addEntity(this.gameAreaEntity);
    this.gameInfoEntity = new GameInfoEntity(this.desktopEntity, 0, 16*8, 32*8, 8*8);
    this.desktopEntity.addEntity(this.gameInfoEntity);

    this.app.stack.flashState = false;
    this.sendEvent(330, {id: 'changeFlashState'});

    if (this.app.restartInGameMelody) {
      this.app.restartInGameMelody = false;
      this.sendEvent(0, {id: 'playSound', channel: 'music', sound: 'inGameMelody', options: {repeat: true, lives: this.app.lives}});
    }

    var roomId = 'room'+this.roomNumber.toString().padStart(2, '0');
    this.fetchData(roomId+'.data', {key: roomId, when: 'required'}, {});
  } // init

  shutdown() {
    super.shutdown();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.app.audioManager.stopChannel('extra');
  } // shutdown

  newBorderEntity() {
    return new BorderEntity(true, this.app.controls.touchscreen.supported & !this.demo);
  } // newBorderEntity

  setData(data) {
    if (!('willy' in data.data)) {
      data.data.willy = {...this.app.globalData.willy};
    } else {
      data.data.willy = {...this.app.globalData.willy, ...data.data.willy};
    }
    if (this.app.willyRoomsCache.init) {
      this.app.willyRoomsCache.init = false;
      this.app.willyRoomsCache.x = data.data.willy.init.x;
      this.app.willyRoomsCache.y = data.data.willy.init.y;
      this.app.willyRoomsCache.frame = data.data.willy.init.frame;
      this.app.willyRoomsCache.direction = data.data.willy.init.direction;
    }

    if ('teleport' in data.data) {
      if ('left' in data.data.teleport) {
        this.adjoiningRoom.left = data.data.teleport.left;
      }
      if ('right' in data.data.teleport) {
        this.adjoiningRoom.right = data.data.teleport.right;
      }
      if ('above' in data.data.teleport) {
        this.adjoiningRoom.above = data.data.teleport.above;
      }
      if ('below' in data.data.teleport) {
        this.adjoiningRoom.below = data.data.teleport.below;
      }
    }

    var x = this.app.roomsMapPositions[this.roomNumber].x;
    var y = this.app.roomsMapPositions[this.roomNumber].y;
    var roomsMap = this.app.globalData.roomsMap.positions;
    if (!this.adjoiningRoom.left && x > 0 && roomsMap[y][x-1] !== false) {
      this.adjoiningRoom.left = roomsMap[y][x-1];
    }
    if (!this.adjoiningRoom.right && x < roomsMap[y].length-1 && roomsMap[y][x+1] !== false) {
      this.adjoiningRoom.right = roomsMap[y][x+1];
    }
    if (!this.adjoiningRoom.above && y > 0 && roomsMap[y-1][x] !== false) {
      this.adjoiningRoom.above = roomsMap[y-1][x];
    }
    if (!this.adjoiningRoom.below && y < roomsMap.length-1 && roomsMap[y+1][x] !== false) {
      this.adjoiningRoom.below = roomsMap[y+1][x];
    }

    this.gameInfoEntity.roomNameEntity.setText(data.data.name);
    this.app.roomName = data.data.name;
    this.borderEntity.bkColor = this.app.platform.zxColorByAttr(this.app.hexToInt(data.data.borderColor), 7, 1);
    for (var l = 0; l < this.app.lives; l++) {
      this.gameInfoEntity.liveEntities[l].setGraphicsData(data.data.willy);
    }
    super.setData(data.data);
    this.app.inputEventsManager.sendEventsActiveKeys('Press');
    this.postWorkerMessage({id: 'init', initData: this.initData});
  } // setData

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'blurWindow':
        this.postWorkerMessage({id: 'pause'});
        this.app.audioManager.pauseAllChannels();
        this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 52, 40, 153, 85, 'PAUSE GAME', 'GameExitModel'));
        return true;

      case 'continueGame':        
        this.postWorkerMessage({id: 'continue'});
        this.app.audioManager.continueAllChannels();
        return true;

      case 'keyPress':
        var key = event.key;
        if (key.length == 1) {
          key = key.toUpperCase();
        }

        if (this.demo) {
          switch (key) {
            case 'Mouse1':
            case 'Mouse2':
            case 'Mouse4':
              this.app.inputEventsManager.keysMap[event.key] = this.borderEntity;
              return true;

            case 'Touch':
              this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity;
              return true;
          }
          this.app.setModel('MainModel');
          return true;
        }

        switch (key) {
          case 'Escape':
          case 'GamepadExit':
            this.postWorkerMessage({id: 'pause'});
            this.app.audioManager.pauseAllChannels();
            this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 52, 40, 153, 85, 'PAUSE GAME', 'GameExitModel'));
            return true;

          case this.app.controls.mouse.right:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.right] === false) {
              this.postWorkerMessage({id: 'controls', action: 'right', value: true});
            }
            return true;

          case 'Touch':
            if (this.borderEntity.leftControlEntity.pointOnEntity(event)) {
              this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity.leftControlEntity;
              this.app.inputEventsManager.touchesControls.left[event.identifier] = true;
              this.postWorkerMessage({id: 'controls', action: 'left', value: true});
              return true;
            }
            if (this.borderEntity.rightControlEntity.pointOnEntity(event)) {
              this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity.rightControlEntity;
              this.app.inputEventsManager.touchesControls.right[event.identifier] = true;
              this.postWorkerMessage({id: 'controls', action: 'right', value: true});
              return true;
            }
            if (this.borderEntity.jumpControlEntity.pointOnEntity(event)) {
              this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity.jumpControlEntity;
              this.app.inputEventsManager.touchesControls.jump[event.identifier] = true;
              this.postWorkerMessage({id: 'controls', action: 'jump', value: true});
              return true;
            }
            break;

          case 'Touch.left':
            this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity.leftControlEntity;
            this.postWorkerMessage({id: 'controls', action: 'left', value: true});
            return true;

          case 'Touch.right':
            this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity.rightControlEntity;
            this.postWorkerMessage({id: 'controls', action: 'right', value: true});
            return true;

          case 'Touch.jump':
            this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity.jumpControlEntity;
            this.postWorkerMessage({id: 'controls', action: 'jump', value: true});
            return true;

          case this.app.controls.keyboard.right:
          case 'GamepadRight':  
            this.postWorkerMessage({id: 'controls', action: 'right', value: true});
            return true;

          case this.app.controls.mouse.left:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.left] === false) {
              this.postWorkerMessage({id: 'controls', action: 'left', value: true});
            }
            return true;

          case this.app.controls.keyboard.left:
          case 'GamepadLeft':  
            this.postWorkerMessage({id: 'controls', action: 'left', value: true});
            return true;

          case this.app.controls.mouse.jump:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.jump] === false) {
              this.postWorkerMessage({id: 'controls', action: 'jump', value: true});
              break;
            }
            return true;

          case this.app.controls.keyboard.jump:
          case 'GamepadJump':  
            this.postWorkerMessage({id: 'controls', action: 'jump', value: true});
            return true;

          case this.app.controls.keyboard.music:
            this.app.muted.music = !this.app.muted.music;
            this.app.audioManager.muteChannel('music', this.app.muted.music);
            return true;

          case this.app.controls.keyboard.sounds:
            this.app.muted.sounds = !this.app.muted.sounds;
            this.app.audioManager.muteChannel('sounds', this.app.muted.sounds);
            this.app.audioManager.muteChannel('extra', this.app.muted.sounds);
            return true;
        }
        break;

      case 'keyRelease':
        var key = event.key;
        if (key.length == 1) {
          key = key.toUpperCase();
        }

        if (this.demo) {
          switch (key) {
            case 'Mouse1':
            case 'Mouse2':
            case 'Mouse4':
              if (this.app.inputEventsManager.keysMap[event.key] === this.borderEntity) {
                this.app.setModel('MainModel');
                return true;
              }
              break;
              
            case 'Touch':
              if (this.app.inputEventsManager.touchesMap[event.identifier] === this.borderEntity) {
                this.app.setModel('MainModel');
                return true;
              }
              break;
          }
          return true;
        }

        switch (key) {
          case this.app.controls.mouse.right:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.right] === false) {
              this.postWorkerMessage({id: 'controls', action: 'right', value: false});
            }
            return true;

          case 'Touch':
            if (this.app.inputEventsManager.touchesMap[event.identifier] === this.borderEntity.leftControlEntity) {
              if (Object.keys(this.app.inputEventsManager.touchesControls.left).length == 1) {
                this.postWorkerMessage({id: 'controls', action: 'left', value: false});
              }
              return true;
            }
            if (this.app.inputEventsManager.touchesMap[event.identifier] === this.borderEntity.rightControlEntity) {
              if (Object.keys(this.app.inputEventsManager.touchesControls.right).length == 1) {
                this.postWorkerMessage({id: 'controls', action: 'right', value: false});
              }
              return true;
            }
            if (this.app.inputEventsManager.touchesMap[event.identifier] === this.borderEntity.jumpControlEntity) {
              if (Object.keys(this.app.inputEventsManager.touchesControls.jump).length == 1) {
                this.postWorkerMessage({id: 'controls', action: 'jump', value: false});
              }
              return true;
            }
            break;

          case this.app.controls.keyboard.right:
          case 'GamepadRight':  
            this.postWorkerMessage({id: 'controls', action: 'right', value: false});
            return true;

          case this.app.controls.mouse.left:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.left] === false) {
              this.postWorkerMessage({id: 'controls', action: 'left', value: false});
            }
            return true;

          case this.app.controls.keyboard.left:
          case 'GamepadLeft':  
            this.postWorkerMessage({id: 'controls', action: 'left', value: false});
            return true;

          case this.app.controls.mouse.jump:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.jump] === false) {
              this.postWorkerMessage({id: 'controls', action: 'jump', value: false});
            }
            return true;

          case this.app.controls.keyboard.jump:
          case 'GamepadJump':  
            this.postWorkerMessage({id: 'controls', action: 'jump', value: false});
            return true;
        }
        break;

      case 'animationDemoRoomDone':
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
        this.gameAreaEntity.setMonochromeColors(this.app.platform.color(3), this.app.platform.color(7));
        this.animationTime = this.timer;
        this.animationType = 'demoRoomDone';
        break;

      case 'newDemoRoom':
        if (this.app.demoRooms.length > 0) {
          this.app.roomNumber = this.app.demoRooms[0];
          this.app.demoRooms.splice(0, 1);
          this.app.demo = true;
          this.app.startRoom(true, false, false, false, false, false);
          return true;
        }
        this.app.setModel('MainModel');
        return true;

      case 'changeRoom':
        this.app.roomNumber = event.adjoiningRoom;
        this.app.willyRoomsCache = event.willyData;
        this.app.willyRoomsCache.previousDirection = event.previousDirection;
        this.app.willyRoomsCache.jumpCounter = event.jumpCounter;
        this.app.willyRoomsCache.jumpDirection = event.jumpDirection;
        this.app.willyRoomsCache.fallingCounter = event.fallingCounter;
        this.app.willyRoomsCache.fallingDirection = event.fallingDirection;
        this.app.startRoom(false, false, false, false, this.app.extraGame, false);
        break;

      case 'crash':
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
        this.gameAreaEntity.spriteEntities.willy[0].hide = true;
        this.sendEvent(0, {id: 'stopAllAudioChannels'});
        this.borderEntity.bkColor = this.app.platform.color(0);
        this.gameAreaEntity.setMonochromeColors(this.app.platform.color(15), this.app.platform.color(0));
        this.sendEvent(0, {id: 'playSound', channel: 'sounds', sound: 'crashSound', options: false});
        this.animationTime = this.timer;
        this.animationType = 'crash';
        this.app.restartInGameMelody = true;
        return true;

      case 'gameOver':
        this.app.setModel('GameOverModel');
        return true;

      case 'changeFlashState':
        this.app.stack.flashState = !this.app.stack.flashState;
        if (this.animationTime === false) {
          this.sendEvent(330, {id: 'changeFlashState'});
        } else {
          this.app.stack.flashState = false;
        }
        return true;

    }

    return false;
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);

    this.timer = timestamp;

    if (this.animationTime != false) {
      var animTime = timestamp-this.animationTime;
      switch (this.animationType) {
        case 'crash':
          var monochromeColor = Math.round(15-animTime/30);
          if (monochromeColor < 8) {
            monochromeColor = 0;
          }
          this.gameAreaEntity.setMonochromeColors(this.app.platform.color(monochromeColor), this.app.platform.colorByName('black'));
          if (animTime > 240) {
            this.animationTime = false;
            this.animationType = false;
            if (this.app.lives > 0) {
              this.app.lives--;
              this.app.startRoom(false, false, true, false, this.app.extraGame, false);
            } else {
              this.app.setModel('GameOverModel');
            }
          }
          break;

        case 'demoRoomDone':
          var monochromeAttr = Math.round(59-animTime/8.62);
          if (monochromeAttr < 1) {
            monochromeAttr = 1;
          }
          var penColor = this.app.platform.penColorByAttr(monochromeAttr);
          var bkColor = this.app.platform.bkColorByAttr(monochromeAttr);
          this.gameAreaEntity.setMonochromeColors(penColor, bkColor);
          this.gameInfoEntity.roomNameEntity.bkColor = bkColor;
          this.gameInfoEntity.roomNameEntity.setPenColor(penColor);
          if (animTime > 500) {
            this.borderEntity.bkColor = this.app.platform.colorByName('black');
            this.sendEvent(1, {id: 'newDemoRoom'});
            this.animationTime = false;
            this.animationType = false;
          }
          break;

      }
    }

    if (this.needDraw) {
      this.drawModel();
    }
    this.needDraw = true;
  } // loopModel

} // RoomModel

export default RoomModel;
