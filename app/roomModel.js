/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { GameAreaEntity } = await import('./gameAreaEntity.js?ver='+window.srcVersion);
const { GameInfoEntity } = await import('./gameInfoEntity.js?ver='+window.srcVersion);
const { PauseGameEntity } = await import('./pauseGameEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
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
    this.adjoiningRoom = null;
    this.demo = demo;
    this.bkAnimation = false;
    this.animationTime = false;
    this.animationType = false;
    this.autorepeatKeys = false;
    this.needDraw = true;

    this.initData = {
      info: [
        0, // counter
        0, // counter2
        0, // counter4
        0, // counter6
        demo,
        false, // crash
        this.app.itemsCollected,
        false, // adjoining room
        false // Willy data
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
                if (event.data.gameData.info[7] !== false) {
                  this.app.timeCounter += event.data.gameData.info[0]; 
                  this.sendEvent(1, {id: 'changeRoom', adjoiningRoom: this.app.hexToInt(this.adjoiningRoom[event.data.gameData.info[7]]), willyData: event.data.gameData.info[8]});
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
                  this.gameInfoEntity.itemsCollectedEntity.setText(Object.keys(this.app.itemsCollected).length.toString().padStart(3, '0'));
                }
                break;
                
              case 'floors':
              case 'walls':
              case 'nasties':
              case 'ramps':
                break;

              default:
                this.gameAreaEntity.updateData(event.data, objectsType);
            }
          });
          this.drawModel();
          this.needDraw = false;
          break;

        case 'playSound':
          this.sendEvent(0, {id: 'playSound', channel: event.data.channel, sound: event.data.sound, options: false});
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
    this.app.audioManager.stopChannel('sounds');
    this.app.audioManager.stopChannel('extra');
  } // shutdown

  setData(data) {
    this.adjoiningRoom = data.data.adjoiningRoom;
    if (!('willy' in data.data)) {
      data.data.willy = this.app.globalData.willy;
    }

    this.gameInfoEntity.roomNameEntity.setText(data.data.name);
    this.app.roomName = data.data.name;
    this.borderEntity.bkColor = this.app.platform.zxColorByAttr(this.app.hexToInt(data.data.borderColor), 7, 1);
    for (var l = 0; l < this.app.lives; l++) {
      this.gameInfoEntity.liveEntities[l].setGraphicsData(data.data.willy);
    }
    super.setData(data.data);
    this.postWorkerMessage({id: 'init', initData: this.initData});
    this.app.inputEventsManager.sendEventsActiveKeys('Press');
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
        if (this.demo) {
          if (event.key.substring(0, 5) != 'Mouse' && event.key != 'Touch') {
            this.app.setModel('MainModel');
            return true;
          }
          if (event.key.substring(0, 5) == 'Mouse') {
            this.app.inputEventsManager.keysMap[event.key] = this;
            return true;
          }
          if (event.key == 'Touch') {
            this.app.inputEventsManager.touchesMap[event.identifier] = this;
            return true;
          }
        }
        var key = event.key;
        if (key.length == 1) {
          key = key.toUpperCase();
        }
        switch (key) {
          case 'Escape':
            this.postWorkerMessage({id: 'pause'});
            this.app.audioManager.pauseAllChannels();
            this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 52, 40, 153, 85, 'PAUSE GAME', 'GameExitModel'));
            return true;

          case this.app.controls.mouse.right:
            if (!this.app.controls.mouse.enable || this.app.inputEventsManager.keysMap[this.app.controls.mouse.right] !== false) {
              break;
            }
          case this.app.controls.keyboard.right:
          case 'Touch2':
          case 'GamepadRight':  
            this.postWorkerMessage({id: 'controls', action: 'right', value: true});
            return true;

          case this.app.controls.mouse.left:
            if (!this.app.controls.mouse.enable || this.app.inputEventsManager.keysMap[this.app.controls.mouse.left] !== false) {
              break;
            }
          case this.app.controls.keyboard.left:
          case 'Touch1':
          case 'GamepadLeft':  
            this.postWorkerMessage({id: 'controls', action: 'left', value: true});
            return true;

          case this.app.controls.mouse.jump:
            if (!this.app.controls.mouse.enable || this.app.inputEventsManager.keysMap[this.app.controls.mouse.jump] !== false) {
              break;
            }
          case this.app.controls.keyboard.jump:
          case 'Touch4':
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
        if (this.demo) {
          if (event.key.substring(0, 5) == 'Mouse' && this.app.inputEventsManager.keysMap[event.key] === this) {
            this.app.setModel('MainModel');
            return true;
          }
          if (event.key == 'Touch' && this.app.inputEventsManager.touchesMap[event.identifier] === this) {
            this.app.setModel('MainModel');
            return true;
          }
        }
        var key = event.key;
        if (key.length == 1) {
          key = key.toUpperCase();
        }
        switch (key) {
          case this.app.controls.mouse.right:
            if (!this.app.controls.mouse.enable || this.app.inputEventsManager.keysMap[this.app.controls.mouse.right] !== false) {
              break;
            }
          case this.app.controls.keyboard.right:
          case 'Touch2':
          case 'GamepadRight':  
            this.postWorkerMessage({id: 'controls', action: 'right', value: false});
            return true;

          case this.app.controls.mouse.left:
            if (!this.app.controls.mouse.enable || this.app.inputEventsManager.keysMap[this.app.controls.mouse.left] !== false) {
              break;
            }
          case this.app.controls.keyboard.left:
          case 'Touch1':
          case 'GamepadLeft':  
            this.postWorkerMessage({id: 'controls', action: 'left', value: false});
            return true;

          case this.app.controls.mouse.jump:
            if (!this.app.controls.mouse.enable || this.app.inputEventsManager.keysMap[this.app.controls.mouse.jump] !== false) {
              break;
            }
          case this.app.controls.keyboard.jump:
          case 'Touch4':
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
          this.app.startRoom(true, false, false);
          return true;
        }
        this.app.setModel('MainModel');
        return true;

      case 'changeRoom':
        this.app.roomNumber = event.adjoiningRoom;
        this.app.willyRoomsCache = event.willyData;
        this.app.startRoom(false, false, false);
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
              this.app.startRoom(false, false, false);
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
