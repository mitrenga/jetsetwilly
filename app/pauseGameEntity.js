/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { MiniTextEntity } = await import('./svision/js/platform/canvas2D/miniTextEntity.js?ver='+window.srcVersion);
const { ZXButtonEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxButtonEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js//abstractEntity.js';
import MiniTextEntity from './svision/js/platform/canvas2D/miniTextEntity.js';
import ZXButtonEntity from './svision/js/platform/canvas2D/zxSpectrum/zxButtonEntity.js';
/**/
// begin code

export class PauseGameEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, borderColor) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'PauseGameEntity';
    this.borderColor = borderColor;
    this.buttons = [];
    this.selectedButton = 0;
  } // constructor

  init() {
    super.init();
    this.addEntity(new AbstractEntity(this, 1, 7, this.width-2, this.height-8, false, this.borderColor));
    this.addEntity(new AbstractEntity(this, 0, 6, this.width, 1, false, this.app.platform.colorByName('brightWhite')));
    this.addEntity(new AbstractEntity(this, 0, 6, 1, this.height-6, false, this.app.platform.colorByName('brightWhite')));
    this.addEntity(new AbstractEntity(this, 0, this.height-1, this.width, 1, false, this.app.platform.colorByName('brightWhite')));
    this.addEntity(new AbstractEntity(this, this.width-1, 6, 1, this.height-6, false, this.app.platform.colorByName('brightWhite')));
    var titleEntity = new MiniTextEntity(this, 0, 0, this.width, 9, 'PAUSE', this.app.platform.colorByName('brightBlack'), this.app.platform.colorByName('brightWhite'), 1, 2);
    titleEntity.justify = 2;
    this.addEntity(titleEntity);
    this.buttons[0] = new ZXButtonEntity(this, 10, 19, this.width-20, 14, 'RESUME GAME', 'closePauseGame', ['Escape'], this.app.platform.colorByName('black'), this.app.platform.colorByName('yellow'), 0, true);
    this.buttons[0].margin = 3;
    this.buttons[0].justify = 0;
    this.addEntity(this.buttons[0]);
    this.buttons[1] = new ZXButtonEntity(this, 10, 43, this.width-20, 14, 'SOUND OFF', 'changeSoundsState', [], this.app.platform.colorByName('black'), this.app.platform.colorByName('white'), 0, true);
    this.buttons[1].margin = 3;
    this.buttons[1].justify = 2;
    this.addEntity(this.buttons[1]);
    this.buttons[2] = new ZXButtonEntity(this, 10, 67, this.width-20, 14, 'MUSIC OFF', 'changeMusicState', [], this.app.platform.colorByName('black'), this.app.platform.colorByName('white'), 0, true);
    this.buttons[2].margin = 3;
    this.buttons[2].justify = 2;
    this.addEntity(this.buttons[2]);
    this.buttons[3] = new ZXButtonEntity(this, 10, 91, this.width-20, 14, 'EXIT GAME', 'exitGame', [], this.app.platform.colorByName('black'), this.app.platform.colorByName('white'), 0, true);
    this.buttons[3].margin = 3;
    this.buttons[3].justify = 2;
    this.addEntity(this.buttons[3]);
  } // init

  handleEvent(event) {
    switch (event.id) {

      case 'keyPress':
        switch (event.key) {
          case 'Enter':
            this.sendEvent(0, 0, {'id': this.buttons[this.selectedButton].eventID});
            return true;
          case 'ArrowDown':
            if (this.selectedButton < this.buttons.length-1) {
              this.buttons[this.selectedButton].setBkColor(this.app.platform.colorByName('white'));
              this.selectedButton++;
              this.buttons[this.selectedButton].setBkColor(this.app.platform.colorByName('yellow'));
            }
            return true;
          case 'ArrowUp':
            if (this.selectedButton > 0) {
              this.buttons[this.selectedButton].setBkColor(this.app.platform.colorByName('white'));
              this.selectedButton--;
              this.buttons[this.selectedButton].setBkColor(this.app.platform.colorByName('yellow'));
            }
            return true;
          }
        break;

      case 'closePauseGame':
        this.destroy();
        return true;

      case 'exitGame':
        this.app.model.shutdown();
        this.app.model = this.app.newModel('MenuModel');
        this.app.model.init();
        this.app.resizeApp();
        return true;
    }

    return super.handleEvent(event);
  } // handleEvent

} // class PauseGameEntity

export default PauseGameEntity;
