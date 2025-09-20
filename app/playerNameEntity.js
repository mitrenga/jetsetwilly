/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
const { MiniTextEntity } = await import('./svision/js/platform/canvas2D/miniTextEntity.js?ver='+window.srcVersion);
const { MiniButtonEntity } = await import('./svision/js/platform/canvas2D/miniButtonEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js//abstractEntity.js';
import ZXTextEntity from './svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
import MiniTextEntity from './svision/js/platform/canvas2D/miniTextEntity.js';
import MiniButtonEntity from './svision/js/platform/canvas2D/miniButtonEntity.js';
/**/
// begin code

export class PlayerNameEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'PlayerNameEntity';    
  } // constructor

  init() {
    super.init();
    this.addEntity(new AbstractEntity(this, 1, 7, this.width-2, this.height-8, false, this.app.platform.colorByName('brightWhite')));
    this.addEntity(new AbstractEntity(this, 0, 6, this.width, 1, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new AbstractEntity(this, 0, 6, 1, this.height-6, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new AbstractEntity(this, 0, this.height-1, this.width, 1, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new AbstractEntity(this, this.width-1, 6, 1, this.height-6, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new MiniTextEntity(this, 0, 0, 63, 7, 'PLAYER NAME', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlack'), 1, 1));
    this.addEntity(new ZXTextEntity(this, 8, 32, this.width-16, 8, 'Enter your player name:', this.app.platform.colorByName('black'), false, 0, 1));
    this.inputLineEntity = new ZXTextEntity(this, 8, 48, this.width-16, 8, 'libmit|', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('magenta'), 0, 1);
    this.setInputLineColors();
    this.addEntity(this.inputLineEntity);
    this.addEntity(new MiniButtonEntity(this, this.width-100, this.height-15, 46, 13, 'CANCEL', 'cancel', ['Escape'], this.app.platform.colorByName('white'), this.app.platform.colorByName('red'), 1, 4));
    this.addEntity(new MiniButtonEntity(this, this.width-48, this.height-15, 46, 13, 'OK', 'ok', ['Enter'], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('green'), 1, 4));
  } // init

  setInputLineColors() {
    this.inputLineEntity.penColorsMap = {};
    for (var ch = 0; ch < this.inputLineEntity.getTextLength(); ch++) {
      if (this.app.stack.flashState && this.inputLineEntity.text[ch] == '|') {
        this.inputLineEntity.penColorsMap[ch] = this.app.platform.colorByName('magenta');
      } else {
        this.inputLineEntity.penColorsMap[ch] = this.app.platform.colorByName('brightWhite');
      }
    }
    this.inputLineEntity.drawingCache[0].cleanCache();
  } // setInputLineColors

  handleEvent(event) {
    switch (event.id) { 
      case 'cancel':
        this.destroy();
        return true;

      case 'ok':
        this.destroy();
        return true;

      case 'changeFlashState':
        this.setInputLineColors();
        break;
    }

    return super.handleEvent(event);
  } // handleEvent

} // class PlayerNameEntity

export default PlayerNameEntity;
