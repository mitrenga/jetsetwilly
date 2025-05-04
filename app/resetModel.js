/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { ResetEntity } = await import('./resetEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import ResetEntity from './resetEntity.js';
import ZXTextEntity from './svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
/**/
// begin code

export class ResetModel extends AbstractModel {
  
  constructor(app) {
    super(app);   
    this.id = 'ResetModel';
    this.resetEntity = null;
    this.inputLineEntity = null;
    this.resetTimer = false;
    this.flashState = false;

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

    this.resetEntity = new ResetEntity(this.desktopEntity, 0, 0, 32*8, 24*8);
    this.resetEntity.hide = true;
    this.desktopEntity.addEntity(this.resetEntity);
    this.inputLineEntity = new ZXTextEntity(this.desktopEntity, 0, 23*8, 32*8, 8, '© 2025 GNU General Public Licence', this.app.platform.colorByName('black'), false, 0, true);
    this.inputLineEntity.justify = 2;
    this.inputLineEntity.hide = true;
    this.desktopEntity.addEntity(this.inputLineEntity);
    this.sendEvent(500, {'id': 'showReset'});
  } // init

  handleEvent(event) {
    switch (event['id']) {
      case 'changeFlashState':
        this.flashState = !this.flashState;
        this.inputLineEntity.flashState = this.flashState;
        this.drawModel();
        this.sendEvent(330, {'id': 'changeFlashState'});
        return true;
      case 'showReset':
        this.resetTimer = this.app.now;
        this.resetEntity.hide = false;
        this.sendEvent(this.resetEntity.resetTime+1000, {'id': 'showCopyright'});
        return true;
      case 'showCopyright':
        this.resetTimer = false;
        this.resetEntity.hide = true;
        this.inputLineEntity.hide = false;
        this.drawModel();
        this.sendEvent(1200, {'id': 'setMenuModel'});
        return true;
      case 'setMenuModel':
        this.app.model = this.app.newModel('MenuModel');
        this.app.model.init();
        this.app.resizeApp();
        return true;
      case 'setGlobalData':
        this.app.setGlobalData(event['data']);
        return true;
    }
    return super.handleEvent(event);
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);

    if (this.resetTimer !== false) {
      this.resetEntity.timeTrace = Math.round(this.app.now-this.resetTimer);
      this.drawModel();
    }
  } // loopModel

} // class ResetModel

export default ResetModel;
