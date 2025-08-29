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

    this.initData = {'info': [
      0, // counter
      0, // counter2
      0, // counter4
      0, // counter6
      demo,
      false, // crash
      this.app.itemsCollected
    ]};

    this.worker = new Worker(this.app.importPath+'/gameWorker.js?ver='+window.srcVersion);
    this.worker.onmessage = (event) => {

      if (this.demo && event.data.id == 'update' && event.data.gameData.info[0] == 80) {
        this.sendEvent(1, {'id': 'newDemoRoom'});
      }

      switch (event.data.id) {
        case 'update':
          Object.keys(event.data.gameData).forEach((objectsType) => {
            switch (objectsType) {
              case 'info':
                for (var l = 0; l < this.app.lives; l++) {
                  this.gameInfoEntity.liveEntities[l].x = event.data.gameData.info[3]%4*2+l*16;
                  this.gameInfoEntity.liveEntities[l].frame = event.data.gameData.info[3]%4;
                }
                var hour = 7+Math.floor(event.data.gameData.info[0]/15360);
                if (hour > 23) {
                  this.sendEvent(0, {'id': 'gameOver'});
                }
                if (event.data.gameData.info[5]) {
                  this.sendEvent(0, {'id': 'gameOver'});
                }
                var minute = Math.floor(event.data.gameData.info[0]%15360/256);
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
                if (this.app.itemsCollected != event.data.gameData.info[6]) {
                  this.app.itemsCollected = event.data.gameData.info[6];
                  this.gameInfoEntity.itemsCollectedEntity.setText(this.app.itemsCollected.toString().padStart(3, '0'));
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
          break;

        case 'playSound':
          this.sendEvent(0, {'id': 'playSound', 'channel': event.data.channel, 'sound': event.data.sound, 'options': false});
          break;

        case 'stopChannel':
          this.sendEvent(0, {'id': 'stopChannel', 'channel': event.data.channel});
          break;
      }
    } // onmessage

    const http = new XMLHttpRequest();
    http.responser = this;
    http.open('GET', 'room'+this.roomNumber.toString().padStart(2, '0')+'.data');
    http.send();

    http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(http.responseText);
        this.responser.sendEvent(1, {'id': 'setRoomData', 'data': data});
      }
    }
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('black');
    this.gameAreaEntity = new GameAreaEntity(this.desktopEntity, 0, 0, 32*8, 16*8, this.roomNumber, this.initData, this.demo);
    this.desktopEntity.addEntity(this.gameAreaEntity);
    this.gameInfoEntity = new GameInfoEntity(this.desktopEntity, 0, 16*8, 32*8, 8*8);
    this.desktopEntity.addEntity(this.gameInfoEntity);

    this.sendEvent(330, {'id': 'changeFlashState'});

    if (this.app.audioManager.music > 0) {
      this.sendEvent(250, {'id': 'openAudioChannel', 'channel': 'music'});
      this.sendEvent(500, {'id': 'playSound', 'channel': 'music', 'sound': 'inGameMelody', 'options': {'repeat': true, 'lives': 7}});
    }
    if (this.app.audioManager.sounds > 0) {
      this.sendEvent(250, {'id': 'openAudioChannel', 'channel': 'sounds'});
      this.sendEvent(250, {'id': 'openAudioChannel', 'channel': 'extra'});
    }
  } // init

  shutdown() {
    super.shutdown();
    this.worker.terminate();
    this.worker = null;
  } // shutdown

  setData(data) {
    this.gameInfoEntity.roomNameEntity.setText(data.name);
    this.app.roomName = data.name;
    this.borderEntity.bkColor = this.app.platform.zxColorByAttr(this.app.hexToInt(data.borderColor), 7, 1);
    for (var l = 0; l < this.app.lives; l++) {
      this.gameInfoEntity.liveEntities[l].setGraphicsData(data.willy);
    }
    super.setData(data);
    this.worker.postMessage({'id': 'init', 'initData': this.initData});
  } // setData

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'setRoomData':
        this.adjoiningRoom = event.data.adjoiningRoom;
        if (!('willy' in event.data)) {
          event.data.willy = this.app.globalData.willy;
        }
        this.setData(event.data);
        return true;

      case 'keyPress':
        if (this.demo) {
          this.app.model.shutdown();
          this.app.model = this.app.newModel('MainModel');
          this.app.model.init();
          this.app.resizeApp();
          return true;
        }
        switch (event.key) {
          case 'Escape':
            this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 9*8, 5*8, 14*8+1, 14*8+2, this.borderEntity.bkColor));
            return true;
          case 'ArrowRight':
            this.worker.postMessage({'id': 'controls', 'action': 'right', 'value': true});
            return true;
          case 'ArrowLeft':
            this.worker.postMessage({'id': 'controls', 'action': 'left', 'value': true});
            return true;
          case 'ArrowUp':
          case ' ':
            this.worker.postMessage({'id': 'controls', 'action': 'jump', 'value': true});
            return true;
        }
        break;

      case 'keyRelease':
        switch (event.key) {
          case 'ArrowRight':
            this.worker.postMessage({'id': 'controls', 'action': 'right', 'value': false});
            return true;
          case 'ArrowLeft':
            this.worker.postMessage({'id': 'controls', 'action': 'left', 'value': false});
            return true;
          case 'ArrowUp':
          case ' ':
            this.worker.postMessage({'id': 'controls', 'action': 'jump', 'value': false});
            return true;
        }
        break;

      case 'mouseClick':
        if (this.demo) {
          this.app.model.shutdown();
          this.app.model = this.app.newModel('MainModel');
          this.app.model.init();
          this.app.resizeApp();
          return true;
        }
        break;

      case 'newDemoRoom':
        this.app.model.shutdown();
        if (this.app.demoRooms.length > 0) {
          this.app.roomNumber = this.app.demoRooms[0];
          this.app.demoRooms.splice(0, 1);
          this.app.demo = true;
          this.app.model = this.app.newModel('RoomModel');
          this.app.model.init();
          this.app.resizeApp();
          return true;
        }
        this.app.model = this.app.newModel('MainModel');
        this.app.model.init();
        this.app.resizeApp();
        return true;

      case 'gameOver':
        this.app.model.shutdown();
        this.app.model = this.app.newModel('GameOverModel');
        this.app.model.init();
        this.app.resizeApp();
        return true;

      case 'changeFlashState':
        this.app.stack.flashState = !this.app.stack.flashState;
        this.sendEvent(330, {'id': 'changeFlashState'});
        return true;

    }

    return false;
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);
    this.drawModel();
  } // loopModel

} // class RoomModel

export default RoomModel;
