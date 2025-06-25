/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
const { GameAreaEntity } = await import('./gameAreaEntity.js?ver='+window.srcVersion);
const { PauseGameEntity } = await import('./pauseGameEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import ZXTextEntity from '././svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
import GameAreaEntity from './gameAreaEntity.js';
import PauseGameEntity from './pauseGameEntity.js';
/**/
// begin code

export class RoomModel extends AbstractModel {
  
  constructor(app, roomNumber) {
    super(app);
    this.id = 'RoomModel';

    this.roomNumber = roomNumber;
    this.roomEntity = null;
    this.roomNameEntity = null;
    this.scoreEntity = null;
    this.adjoiningRoom = null;
    this.worker = null;

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
    this.gameAreaEntity = new GameAreaEntity(this.desktopEntity, 0, 0, 32*8, 16*8, this.roomNumber);
    this.desktopEntity.addEntity(this.gameAreaEntity);
    this.roomNameEntity = new ZXTextEntity(this.desktopEntity, 0, 16*8, 32*8, 8, '', this.app.platform.colorByName('brightYellow'), this.app.platform.colorByName('brightBlack'), 0, true);
    this.roomNameEntity.justify = 2;
    this.desktopEntity.addEntity(this.roomNameEntity);

    if (this.app.audioManager.music > 0) {
      this.sendEvent(250, {'id': 'openAudioChannel', 'channel': 'music'});
      this.sendEvent(500, {'id': 'playSound', 'channel': 'music', 'sound': 'inGameMelody', 'options': {'repeat': true, 'lives': 7}});
    }
    if (this.app.audioManager.sounds > 0) {
      this.sendEvent(250, {'id': 'openAudioChannel', 'channel': 'sounds'});
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
    super.setData(data);
    this.worker = new Worker(this.app.importPath+'/gameWorker.js');
  } // setData

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'setRoomData':
        this.adjoiningRoom = event.data.adjoiningRoom;
        event.data.willy = this.app.globalData.willy;
        event.data.initRoom = this.app.globalData.initRoom;
        this.setData(event.data);
        return true;

      case 'keyPress':
        switch (event.key) {
          case 'Escape':
            this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 9*8, 5*8, 14*8+1, 14*8+2, this.borderEntity.bkColor));
            return true;
        }
    }

    return false;
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);
    this.drawModel();
  } // loopModel

} // class RoomModel

export default RoomModel;
