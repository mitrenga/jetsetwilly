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

export class IntroModel extends AbstractModel {
  
  constructor(app) {
    super(app);   
    this.id = 'IntroModel';
    this.resetEntity = null;
    this.inputLineEntity = null;
    this.resetTimer = false;
    this.flashState = false;
  } // constructor

  init() {
    super.init();

    this.resetEntity = new ResetEntity(this.desktopEntity, 0, 0, 32*8, 24*8);
    this.resetEntity.hide = true;
    this.desktopEntity.addEntity(this.resetEntity);
    this.inputLineEntity = new ZXTextEntity(this.desktopEntity, 0, 23*8, 32*8, 8, '© 2025 GNU General Public Licence', this.app.platform.colorByName('black'), false, 0, true);
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
        this.sendEvent(2000, {'id': 'showK'});
        return true;
      case 'showK':
          this.inputLineEntity.text = 'K';
          this.inputLineEntity.flashMask = 'i';
          this.inputLineEntity.proportional = false;
          this.drawModel();
          this.flashState = 0;
          this.sendEvent(330, {'id': 'changeFlashState'});
          this.sendEvent(1000, {'id': 'showLOAD'});
          return true;
      case 'showLOAD':
        this.inputLineEntity.text = 'LOAD L';
        this.inputLineEntity.flashMask = '     i';
        this.drawModel();
        this.sendEvent(1000, {'id': 'showLOAD "'});
        return true;
      case 'showLOAD "':
        this.inputLineEntity.text = 'LOAD "L';
        this.inputLineEntity.flashMask = '      i';
        this.drawModel();
        this.sendEvent(500, {'id': 'showLOAD ""'});
        return true;
      case 'showLOAD ""':
        this.inputLineEntity.text = 'LOAD ""L';
        this.inputLineEntity.flashMask = '       i';
        this.drawModel();
        this.sendEvent(500, {'id': 'startLoading'});
        return true;
      case 'startLoading':
        this.cancelEvent('changeFlashState');
        this.inputLineEntity.hide = true;
        this.drawModel();
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

} // class IntroModel

export default IntroModel;
