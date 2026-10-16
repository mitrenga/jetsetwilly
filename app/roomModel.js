const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { Tool } = await import('./svision/js/tool.js?ver='+window.srcVersion);
const { BorderEntity } = await import('./borderEntity.js?ver='+window.srcVersion);
const { GameAreaEntity } = await import('./gameAreaEntity.js?ver='+window.srcVersion);
const { GameInfoEntity } = await import('./gameInfoEntity.js?ver='+window.srcVersion);
const { PauseGameEntity } = await import('./pauseGameEntity.js?ver='+window.srcVersion);
const { SpriteTool } = await import('./svision/js/spriteTool.js?ver='+window.srcVersion);
const { ZXColor } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxColor.js?ver='+window.srcVersion);
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
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = ZXColor.black;
    this.desktopEntity.bkColor = ZXColor.black;
    this.gameAreaEntity = new GameAreaEntity(this.desktopEntity, 0, 0, 32*8, 16*8, this.roomNumber, this.initData, this.demo);
    this.desktopEntity.addEntity(this.gameAreaEntity);
    this.gameInfoEntity = new GameInfoEntity(this.desktopEntity, 0, 16*8, 32*8, 8*8);
    this.desktopEntity.addEntity(this.gameInfoEntity);

    this.showTouchIcons();

    this.app.stack.flashState = false;
    this.sendEvent(330, {id: 'changeFlashState'});

    if (this.app.restartInGameMelody) {
      this.app.restartInGameMelody = false;
      this.sendEvent(0, {id: 'playSound', bus: 'music', sound: 'inGameMelody', options: {repeat: true, lives: this.app.lives}});
    }

    var roomId = 'room'+this.roomNumber.toString().padStart(2, '0');
    this.fetchData(roomId+'.data', {key: roomId, when: 'required'}, {});
  } // init

  shutdown() {
    super.shutdown();
    this.sendWorkerMessage({id: 'reset'});
    this.sendEvent(0, {id: 'stopAudioBus', bus: 'extra'});
  } // shutdown

  newBorderEntity() {
    return new BorderEntity(true, this.app.controls.touchscreen.supported & !this.demo);
  } // newBorderEntity

  setData(data) {
    if (data.url == 'saveGame.db') {
      return;
    }
    
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
    this.borderEntity.bkColor = ZXColor.attrColor(Tool.hexToInt(data.data.borderColor), 7, 1);
    for (var l = 0; l < this.app.lives; l++) {
      this.gameInfoEntity.liveEntities[l].setGraphicsData(data.data.willy);
    }
    this.app.inputEventsManager.sendEventsActiveKeys('Press');
    SpriteTool.scriptedSprite(this, this.app.appIconSprite);
    super.setData(data.data);
    this.sendWorkerMessage({id: 'init', initData: this.initData});
  } // setData

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'blurWindow':
        this.sendWorkerMessage({id: 'pause'});
        this.sendEvent(0, {id: 'pauseAllAudioBuses'});
        this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 52, 40, 153, 85, 'PAUSE GAME', 'GameExitModel'));
        return true;

      case 'continueGame':        
        this.sendWorkerMessage({id: 'continue'});
        this.sendEvent(0, {id: 'continueAllAudioBuses'});
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
            this.sendWorkerMessage({id: 'pause'});
            this.sendEvent(0, {id: 'pauseAllAudioBuses'});
            this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 52, 40, 153, 85, 'PAUSE GAME', 'GameExitModel'));
            return true;

          case this.app.controls.mouse.right:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.right] === false) {
              this.sendWorkerMessage({id: 'controls', action: 'right', value: true});
            }
            return true;

          case 'Touch':
            if (this.borderEntity.leftControlEntity.pointOnEntity(event)) {
              this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity.leftControlEntity;
              this.touchStart(event, 'left');
              return true;
            }
            if (this.borderEntity.rightControlEntity.pointOnEntity(event)) {
              this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity.rightControlEntity;
              this.touchStart(event, 'right');
              return true;
            }
            break;

          case 'RetryTouch':
            this.sendWorkerMessage({id: 'controls', action: event.action, value: true});
            return true;

          case this.app.controls.keyboard.right:
          case 'GamepadRight':  
            this.sendWorkerMessage({id: 'controls', action: 'right', value: true});
            return true;

          case this.app.controls.mouse.left:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.left] === false) {
              this.sendWorkerMessage({id: 'controls', action: 'left', value: true});
            }
            return true;

          case this.app.controls.keyboard.left:
          case 'GamepadLeft':  
            this.sendWorkerMessage({id: 'controls', action: 'left', value: true});
            return true;

          case this.app.controls.mouse.jump:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.jump] === false) {
              this.sendWorkerMessage({id: 'controls', action: 'jump', value: true});
              break;
            }
            return true;

          case this.app.controls.keyboard.jump:
          case 'GamepadJump':  
            this.sendWorkerMessage({id: 'controls', action: 'jump', value: true});
            return true;

          case this.app.controls.keyboard.music:
            this.app.muted.music = !this.app.muted.music;
            this.sendEvent(0, {id: 'muteAudioBus', bus: 'music', muted: this.app.muted.music});
            return true;

          case this.app.controls.keyboard.sounds:
            this.app.muted.sounds = !this.app.muted.sounds;
            this.sendEvent(0, {id: 'muteAudioBus', bus: 'sounds', muted: this.app.muted.sounds});
            this.sendEvent(0, {id: 'muteAudioBus', bus: 'extra', muted: this.app.muted.sounds});
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
              this.sendWorkerMessage({id: 'controls', action: 'right', value: false});
            }
            return true;

          case 'Touch':
            this.touchEnd(event);
            return true;

          case this.app.controls.keyboard.right:
          case 'GamepadRight':  
            this.sendWorkerMessage({id: 'controls', action: 'right', value: false});
            return true;

          case this.app.controls.mouse.left:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.left] === false) {
              this.sendWorkerMessage({id: 'controls', action: 'left', value: false});
            }
            return true;

          case this.app.controls.keyboard.left:
          case 'GamepadLeft':  
            this.sendWorkerMessage({id: 'controls', action: 'left', value: false});
            return true;

          case this.app.controls.mouse.jump:
            if (this.app.controls.mouse.enable && this.app.inputEventsManager.keysMap[this.app.controls.mouse.jump] === false) {
              this.sendWorkerMessage({id: 'controls', action: 'jump', value: false});
            }
            return true;

          case this.app.controls.keyboard.jump:
          case 'GamepadJump':  
            this.sendWorkerMessage({id: 'controls', action: 'jump', value: false});
            return true;
        }
        break;

      case 'keyMove':
        switch (event.key) {
          case 'Touch':
            this.touchMove(event);
            return true;
        }
        break;

      case 'animationDemoRoomDone':
        this.sendWorkerMessage({id: 'reset'});
        this.gameAreaEntity.setMonochromeColors(ZXColor.color(3), ZXColor.color(7));
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
        if (this.animationTime !== false) {
          return true;
        }
        this.sendWorkerMessage({id: 'reset'});
        if (!this.demo) {
          this.gameAreaEntity.spriteEntities.willy[0].hide = true;
        }
        this.sendEvent(0, {id: 'stopAllAudioBuses'});
        this.borderEntity.bkColor = ZXColor.color(0);
        this.gameAreaEntity.setMonochromeColors(ZXColor.color(15), ZXColor.color(0));
        this.sendEvent(0, {id: 'playSound', bus: 'sounds', sound: 'crashSound', options: false});
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

  /**
   * Ikony do okraje: co která polovina obrazovky dělá (šipky vlevo/vpravo,
   * skok). Která je která, říká volba v SETTINGS (`controls.touchscreen.type`);
   * obrázky jsou `controlsOptions.touchscreen.icons` podle `icon` poloviny.
   */
  showTouchIcons() {
    if (!this.app.controls.touchscreen.supported || !this.borderEntity) {
      return;
    }
    var icons = this.app.controlsOptions.touchscreen.icons;
    this.borderEntity.setGameControlIcons(icons[this.touchHalf('left').icon], icons[this.touchHalf('right').icon]);
  } // showTouchIcons

  /**
   * Co dělá tahle polovina obrazovky (`controlsOptions.touchscreen.halves`):
   * páka, nebo skok, podle volby pro leváky a praváky v SETTINGS.
   * @param {string} side - 'left' nebo 'right'.
   * @returns {Object} {icon, zones}
   */
  touchHalf(side) {
    var ts = this.app.controlsOptions.touchscreen;
    return ts.halves[ts.types[this.app.controls.touchscreen.type][side].half];
  } // touchHalf

  /**
   * Plocha poloviny pod prstem. `rect` je zlomek poloviny, takže se počítá
   * z toho, kde na polovině prst je, ne z pixelů.
   * @param {Object} event - Dotyk (x, y).
   * @param {string} side - 'left' nebo 'right'.
   * @returns {Object|false} Plocha, nebo false.
   */
  touchZone(event, side) {
    var entity = side == 'left' ? this.borderEntity.leftControlEntity : this.borderEntity.rightControlEntity;
    var half = this.touchHalf(side);
    var rx = (event.x-(entity.parentX+entity.x))/Math.max(entity.width, 1);
    var ry = (event.y-(entity.parentY+entity.y))/Math.max(entity.height, 1);
    for (var z = 0; z < half.zones.length; z++) {
      var r = half.zones[z].rect;
      if (rx >= r[0] && rx <= r[0]+r[2] && ry >= r[1] && ry <= r[1]+r[3]) {
        return half.zones[z];
      }
    }
    return false;
  } // touchZone

  touchStart(event, side) {
    var zone = this.touchZone(event, side);
    if (zone === false) {
      return;
    }
    // tlačítko drží akci od chvíle, kdy prst dosedne; páka nedělá nic,
    // dokud se prst nepohne
    var action = zone.type == 'button' ? zone.action : false;
    if (action !== false) {
      this.sendWorkerMessage({id: 'controls', action: action, value: true});
    }
    this.app.inputEventsManager.touchesGameControls[event.identifier] = {center: {x: event.x, y: event.y}, type: zone.type, control: zone.control, action: action, actions: zone.actions || false};
  } // touchStart

  touchEnd(event) {
    if (event.identifier in this.app.inputEventsManager.touchesGameControls) {
      if (this.app.inputEventsManager.touchesGameControls[event.identifier].action !== false) {
        this.sendWorkerMessage({id: 'controls', action: this.app.inputEventsManager.touchesGameControls[event.identifier].action, value: false});
      }
      delete this.app.inputEventsManager.touchesGameControls[event.identifier];
    }
  } // touchEnd

  /**
   * Prst se pohnul. Páka je **relativní**: ujede-li prst od středu víc než
   * `joystickStep`, směr se přepne a střed jde za prstem – směr tedy drží,
   * dokud prst nejede opačně, i když se vrátí, kde dosedl.
   * @param {Object} event - Dotyk.
   */
  touchMove(event) {
    if (event.identifier in this.app.inputEventsManager.touchesGameControls) {
      var touchGameControl = this.app.inputEventsManager.touchesGameControls[event.identifier];
      var action = touchGameControl.action;
      if (touchGameControl.type == 'joystick') {
        var step = this.app.controlsOptions.touchscreen.joystickStep;
        var actions = touchGameControl.actions;
        switch (touchGameControl.control) {
          case 'horizontal':
            if (event.x-touchGameControl.center.x < -step) {
              action = actions.left;
              touchGameControl.center.x = event.x;
            }
            if (event.x-touchGameControl.center.x > step) {
              action = actions.right;
              touchGameControl.center.x = event.x;
            }
            break;
          case 'vertical':
            if (event.y-touchGameControl.center.y < -step) {
              action = actions.up;
              touchGameControl.center.y = event.y;
            }
            if (event.y-touchGameControl.center.y > step) {
              action = actions.down;
              touchGameControl.center.y = event.y;
            }
            break;
        }
        if (touchGameControl.action !== action) {
          if (touchGameControl.action !== false) {
            this.sendWorkerMessage({id: 'controls', action: touchGameControl.action, value: false});
          }
          touchGameControl.action = action;
          this.sendWorkerMessage({id: 'controls', action: touchGameControl.action, value: true});
        }
      }
    }
  } // touchMove

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
          this.gameAreaEntity.setMonochromeColors(ZXColor.color(monochromeColor), ZXColor.black);
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
          var penColor = ZXColor.penAttrColor(monochromeAttr);
          var bkColor = ZXColor.bkAttrColor(monochromeAttr);
          this.gameAreaEntity.setMonochromeColors(penColor, bkColor);
          this.gameInfoEntity.roomNameEntity.bkColor = bkColor;
          this.gameInfoEntity.roomNameEntity.setPenColor(penColor);
          if (animTime > 500) {
            this.borderEntity.bkColor = ZXColor.black;
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

  sendWorkerMessage(event) {
    if (this.app.worker) {
      this.app.worker.postMessage(event);
    }
  } // sendWorkerMessage

  handleWorkerMessage(event) {
    if (this.demo && event.data.id == 'update' && event.data.gameData.info[0] == 80) {
      this.sendEvent(1, {id: 'animationDemoRoomDone'});
      return;
    }

    switch (event.data.id) {
      case 'update':
        if (this.bkAnimation !== false) {
          this.gameAreaEntity.bkColor = ZXColor.color(this.bkAnimation);
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
              if (this.animationTime !== false) {
                break;
              }
              this.app.gameState = event.data.gameData.info[9];
              if (this.app.gameState == 2 && !this.app.extraGame && !this.app.gameCompleted) {
                this.app.gameCompleted = 1;
                this.fetchData('saveGame.db', false, {name: this.app.playerName, score: Object.keys(this.app.itemsCollected).length, completed: 1});
              }
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
                break;
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
        this.sendEvent(0, {id: 'playSound', bus: event.data.bus, sound: event.data.sound, options: event.data.options});
        break;

      case 'stopAudioBus':
        this.sendEvent(0, {id: 'stopAudioBus', bus: event.data.bus});
        break;

      case 'crash':
        this.app.timeCounter += event.data.gameData.info[0];
        this.sendEvent(1, {id: 'crash'});
        break;
    }
  } // getWorkerMessage

} // RoomModel
