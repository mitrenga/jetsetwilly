/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
const { GameAreaEntity } = await import('./gameAreaEntity.js?ver='+window.srcVersion);
const { PauseGameEntity } = await import('./pauseGameEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import ZXTextEntity from '././svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
import GameAreaEntity from './gameAreaEntity.js';
import PauseGameEntity from './pauseGameEntity.js';
import SpriteEntity from '././svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class RoomModel extends AbstractModel {
  
  constructor(app, roomNumber, demo) {
    super(app);
    this.id = 'RoomModel';

    this.roomNumber = roomNumber;
    this.roomEntity = null;
    this.roomNameEntity = null;
    this.scoreEntity = null;
    this.liveEntities = [];
    this.liveColors = ['brightCyan', 'yellow', 'green', 'blue', 'cyan', 'brightMagenta', 'brightGreen'];
    this.timeEntity = null;
    this.adjoiningRoom = null;
    this.demo = demo;

    this.initData = {'info': [
      0, // counter
      0, // counter2
      0, // counter4
      0, // counter6
      demo,
      false, // crash
      0 // score
    ]};

    this.worker = new Worker(this.app.importPath+'/gameWorker.js?ver='+window.srcVersion);
    this.worker.onmessage = (event) => {

      if (this.demo && event.data.gameData.info[0] == 80) {
        this.sendEvent(1, {'id': 'newDemoRoom'});
      }

      switch (event.data.id) {
        case 'update':
          Object.keys(event.data.gameData).forEach((objectsType) => {
            switch (objectsType) {
              case 'info':
                for (var l = 0; l < this.app.lives; l++) {
                  this.liveEntities[l].x = event.data.gameData.info[3]%4*2+l*16;
                  this.liveEntities[l].frame = event.data.gameData.info[3]%4;
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
                var timeStr = hour12.toString().padStart(2, ' ')+':'+minute.toString().padStart(2, '0');
                if (hour > 11) {
                  timeStr = timeStr+'pm';
                } else {
                  timeStr = timeStr+'am';
                }
                this.timeEntity.setText(timeStr);
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
    this.roomNameEntity = new ZXTextEntity(this.desktopEntity, 0, 16*8, 32*8, 8, '', this.app.platform.colorByName('brightYellow'), this.app.platform.colorByName('brightBlack'), 0, true);
    this.roomNameEntity.justify = 2;
    this.desktopEntity.addEntity(this.roomNameEntity);
    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 0, 17*8, 32*8, 7*8, false, this.app.platform.colorByName('black')));
    var itemsCollectedEntity = new ZXTextEntity(this.desktopEntity, 1*8, 18*8, 13*8, 8, 'Items collected', false, false, 0, true);
    itemsCollectedEntity.penColorsMap = {};
    for (var c = 0; c < 7; c++) {
      itemsCollectedEntity.penColorsMap[c] = this.app.platform.color(c+1);
    }
    this.desktopEntity.addEntity(itemsCollectedEntity);
    this.desktopEntity.addEntity(new ZXTextEntity(this.desktopEntity, 15*8, 18*8, 3*8, 8, '000', this.app.platform.colorByName('white'), false, 0, true));
    this.desktopEntity.addEntity(new ZXTextEntity(this.desktopEntity, 20*8, 18*8, 4*8, 8, 'Time', this.app.platform.colorByName('white'), false, 0, true));
    this.timeEntity = new ZXTextEntity(this.desktopEntity, 25*8, 18*8, 6*8, 8, ' 7:00am', false, false, 0, true);
    this.timeEntity.justify = 1;
    this.timeEntity.penColorsMap = {};
    for (var c = 0; c < 7; c++) {
      this.timeEntity.penColorsMap[c] = this.app.platform.color(7-c);
    }
    this.desktopEntity.addEntity(this.timeEntity);
    for (var l = 0; l < this.app.lives; l++) {
      this.liveEntities[l] = new SpriteEntity(this.desktopEntity, l*16, 21*8, this.app.platform.colorByName(this.liveColors[l]), false, 0, 0);
      this.desktopEntity.addEntity(this.liveEntities[l]);
    }


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
    this.roomNameEntity.setText(data.name);
    this.borderEntity.bkColor = this.app.platform.zxColorByAttr(this.app.hexToInt(data.borderColor), 7, 1);
    for (var l = 0; l < this.app.lives; l++) {
      this.liveEntities[l].setGraphicsData(data.willy);
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
        this.app.model = this.app.newModel('MainModel');
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
