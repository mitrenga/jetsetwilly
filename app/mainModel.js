/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { BorderEntity } = await import('./borderEntity.js?ver='+window.srcVersion);
const { MainImageEntity } = await import('./mainImageEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import BorderEntity from './borderEntity.js';
import MainImageEntity from './mainImageEntity.js';
import ZXTextEntity from './svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
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
    this.bannerEntity = new ZXTextEntity(this.mainImageEntity, 0, 18*8, 32*8, 1*8, this.bannerTxt, this.app.platform.colorByName('yellow'), this.app.platform.colorByName('black'), 0, false);
    this.mainImageEntity.addEntity(this.bannerEntity);
    if (this.app.audioManager.music > 0) {
      this.sendEvent(500, {'id': 'openAudioChannel', 'channel': 'music'});
      this.sendEvent(750, {'id': 'playSound', 'channel': 'music', 'sound': 'titleScreenMelody', 'options': false});
    }
    this.app.stack.flashState = false;
    this.sendEvent(330, {'id': 'changeFlashState'});
  } // init

  handleEvent(event) {
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
        this.bannerEntity.penColor = this.app.platform.colorByName('brightWhite');
        this.bannerEntity.bkColor = this.app.platform.colorByName('brightBlue');
        this.screechDuration = event.data.duration;
        this.timer = this.app.now;
        this.sendEvent(0, {'id': 'setBorderAnimation', 'value': 'screech'});
        return true;

      case 'screechEnd':
        this.bannerEntity.penColor = this.app.platform.colorByName('yellow');
        this.bannerEntity.bkColor = this.app.platform.colorByName('black');
        this.bannerEntity.x = 0;
        this.bannerEntity.width = 32*8;
        this.mainImageEntity.attrStep = 0;
        this.timer = false;
        this.sendEvent(0, {'id': 'setBorderAnimation', 'value': false});
        this.sendEvent(0, {'id': 'playSound', 'channel': 'music', 'sound': 'titleScreenMelody', 'options': false});
        return true;


    }
    return super.handleEvent(event);
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);

    if (this.timer != false) {
      if (timestamp-this.timer < this.screechDuration) {
        var pos = Math.round((this.bannerTxt.length-32)*8*(timestamp-this.timer)/this.screechDuration);
        this.bannerEntity.x = -pos;
        this.bannerEntity.width = 32*8+pos;

        this.mainImageEntity.attrStep = Math.floor(((timestamp-this.timer)/(1000/15))%8)*3;
      }
    }

    this.drawModel();
  } // loopModel

} // class MainModel

export default MainModel;
