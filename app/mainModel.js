/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { MainImageEntity } = await import('./mainImageEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
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

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('black');
    this.mainImageEntity = new MainImageEntity(this.desktopEntity, 0, 0, 32*8, 16*8, this.flashState);
    this.desktopEntity.addEntity(this.mainImageEntity);
    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 0, 16*8, 32*8, 2*8, false, this.app.platform.colorByName('black')));
    this.desktopEntity.addEntity(new ZXTextEntity(this.desktopEntity, 0, 18*8, 32*8, 1*8, "+++++ Press ENTER to Start +++++", this.app.platform.colorByName('yellow'), this.app.platform.colorByName('black'), 0, false));
    this.desktopEntity.addEntity(new AbstractEntity(this.desktopEntity, 0, 19*8, 32*8, 5*8, false, this.app.platform.colorByName('black')));
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

      case 'melodyCompleted':
        this.sendEvent(0, {'id': 'playSound', 'channel': 'music', 'sound': 'screechSound', 'options': false});
        return true;

      case 'screechCompleted':
        this.sendEvent(0, {'id': 'playSound', 'channel': 'music', 'sound': 'titleScreenMelody', 'options': false});
        return true;


    }
    return super.handleEvent(event);
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);

    this.drawModel();
  } // loopModel

} // class MainModel

export default MainModel;
