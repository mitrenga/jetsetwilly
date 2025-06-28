/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { BorderEntity } = await import('./borderEntity.js?ver='+window.srcVersion);
const { MainImageEntity } = await import('./mainImageEntity.js?ver='+window.srcVersion);
const { BannerTextEntity } = await import('./bannerTextEntity.js?ver='+window.srcVersion);
const { PauseGameEntity } = await import('./pauseGameEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import BorderEntity from './borderEntity.js';
import MainImageEntity from './mainImageEntity.js';
import BannerTextEntity from './bannerTextEntity.js';
import PauseGameEntity from './pauseGameEntity.js';
/**/
// begin code

export class MainModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'MainModel';

    this.mainImageEntity = null;
    this.bannerTxt = '+++++ Press ENTER to Start +++++  JET-SET WILLY by Matthew Smith  © 1984 SOFTWARE PROJECTS Ltd . . . . .Guide Willy to collect all the items around the house before Midnight so Maria will let you get to your bed. . . . . . .+++++ Press ENTER to Start +++++';
    this.bannerEntity = null;
    this.screechDuration = 0;

    const http = new XMLHttpRequest();
    http.responser = this;
    http.open('GET', 'global.data');
    http.send();

    http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(http.responseText);
        this.responser.sendEvent(1, {'id': 'setGlobalData', 'data': data});
      }
    }
  } // constructor

  newBorderEntity() {
    return new BorderEntity(null, 0, 0, 0, 0, false, false);
  } // newBorderEntity

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('black');
    this.mainImageEntity = new MainImageEntity(this.desktopEntity, 0, 0, 32*8, 24*8, this.flashState);
    this.desktopEntity.addEntity(this.mainImageEntity);
    this.bannerEntity = new BannerTextEntity(this.mainImageEntity, 0, 18*8, 32*8, 1*8, this.bannerTxt, this.app.platform.colorByName('yellow'), this.app.platform.colorByName('black'));
    this.mainImageEntity.addEntity(this.bannerEntity);
    if (this.app.audioManager.music > 0) {
      this.sendEvent(250, {'id': 'openAudioChannel', 'channel': 'music'});
      this.sendEvent(500, {'id': 'playSound', 'channel': 'music', 'sound': 'titleScreenMelody', 'options': false});
    }
    this.app.stack.flashState = false;
    this.sendEvent(330, {'id': 'changeFlashState'});
  } // init

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'setGlobalData':
        this.app.setGlobalData(event.data);
        return true;

      case 'changeFlashState':
        this.app.stack.flashState = !this.app.stack.flashState;
        this.sendEvent(330, {'id': 'changeFlashState'});
        return true;

      case 'melodyEnd':
        this.sendEvent(0, {'id': 'playSound', 'channel': 'music', 'sound': 'screechSound', 'options': false});
        return true;

      case 'screechBegin':
        this.bannerEntity.setPenColor(this.app.platform.colorByName('brightWhite'));
        this.bannerEntity.setBkColor(this.app.platform.colorByName('brightBlue'));
        this.screechDuration = event.data.duration;
        this.timer = this.app.now;
        this.sendEvent(0, {'id': 'setBorderAnimation', 'value': 'screech'});
        return true;

      case 'screechEnd':
        this.bannerEntity.setPenColor(this.app.platform.colorByName('yellow'));
        this.bannerEntity.setBkColor(this.app.platform.colorByName('black'));
        this.mainImageEntity.attrStep = 0;
        this.timer = false;
        this.sendEvent(0, {'id': 'setBorderAnimation', 'value': false});
        this.sendEvent(0, {'id': 'playSound', 'channel': 'music', 'sound': 'titleScreenMelody', 'options': false});
        return true;


      case 'keyPress':
        if (this.desktopEntity.modalEntity == null) {
          switch (event.key) {
            case 'Enter':
              this.app.model.shutdown();
              this.app.roomNumber = this.app.globalData.initRoom;
              this.app.model = this.app.newModel('RoomModel');
              this.app.model.init();
              this.app.resizeApp();
              return true;
            case 'Escape':
              this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 9*8, 5*8, 14*8+1, 14*8+2, this.app.platform.colorByName('blue')));
              return true;
          }
        }
        break;

      case 'mouseClick':
        this.app.model.shutdown();
        this.app.roomNumber = this.app.globalData.initRoom;
        this.app.model = this.app.newModel('RoomModel');
        this.app.model.init();
        this.app.resizeApp();
        return true;
    }
    return false;
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);

    if (this.timer != false) {
      if (timestamp-this.timer < this.screechDuration) {
        this.bannerEntity.bannerPosition = Math.round((this.bannerTxt.length-32)*8*(timestamp-this.timer)/this.screechDuration);
        this.mainImageEntity.attrStep = Math.floor(((timestamp-this.timer)/72)%8)*3;
      }
    }

    this.drawModel();
  } // loopModel

} // class MainModel

export default MainModel;
