/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { ButtonEntity } = await import('./svision/js/platform/canvas2D/buttonEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js//abstractEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
import ButtonEntity from './svision/js/platform/canvas2D/buttonEntity.js';
/**/
// begin code

export class PauseGameEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, borderColor, exitModel) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'PauseGameEntity';
    this.borderColor = borderColor;
    this.exitModel = exitModel;
    this.selectedButtonColor = this.app.platform.colorByName('yellow');
    if (this.borderColor == this.selectedButtonColor) {
      this.selectedButtonColor = this.app.platform.colorByName('brightWhite');
    }
    this.buttons = [
      {label: 'RESUME GAME', eventID: 'closePauseGame', hotKeys: ['Escape']},
      {label: 'SOUND OFF', eventID: 'changeSoundsState', hotKeys: []},
      {label: 'MUSIC OFF', eventID: 'changeMusicState', hotKeys: []},
      {label: 'EXIT GAME', eventID: 'exitGame', hotKeys: []}
    ];
    this.buttonsEntities = [];
    this.selectedButton = 0;
  } // constructor

  init() {
    super.init();
    this.addEntity(new AbstractEntity(this, 1, 7, this.width-2, this.height-8, false, this.borderColor));
    this.addEntity(new AbstractEntity(this, 0, 6, this.width, 1, false, this.app.platform.colorByName('brightWhite')));
    this.addEntity(new AbstractEntity(this, 0, 6, 1, this.height-6, false, this.app.platform.colorByName('brightWhite')));
    this.addEntity(new AbstractEntity(this, 0, this.height-1, this.width, 1, false, this.app.platform.colorByName('brightWhite')));
    this.addEntity(new AbstractEntity(this, this.width-1, 6, 1, this.height-6, false, this.app.platform.colorByName('brightWhite')));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 0, 0, this.width, 9, 'PAUSE', this.app.platform.colorByName('brightBlack'), this.app.platform.colorByName('brightWhite'), {align: 'center', margin: 2}));
    for (var b = 0; b < this.buttons.length; b++) {
      var bkColor = this.app.platform.colorByName('white');
      if (b == this.selectedButton) {
        bkColor = this.selectedButtonColor;
      }
      this.buttonsEntities[b] = new ButtonEntity(this, this.app.fonts.zxFonts8x8, 10, 19+b*24, this.width-20, 14, this.buttons[b].label, this.buttons[b].eventID, this.buttons[b].hotKeys, this.app.platform.colorByName('black'), bkColor, {align: 'center', margin: 3});
      this.addEntity(this.buttonsEntities[b]);
    }
  } // init

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {

      case 'keyPress':
        switch (event.key) {
          case 'Enter':
            this.sendEvent(0, 0, {id: this.buttonsEntities[this.selectedButton].eventID});
            return true;
          case 'ArrowDown':
            if (this.selectedButton < this.buttonsEntities.length-1) {
              this.buttonsEntities[this.selectedButton].setBkColor(this.app.platform.colorByName('white'));
              this.selectedButton++;
              this.buttonsEntities[this.selectedButton].setBkColor(this.selectedButtonColor);
            }
            return true;
          case 'ArrowUp':
            if (this.selectedButton > 0) {
              this.buttonsEntities[this.selectedButton].setBkColor(this.app.platform.colorByName('white'));
              this.selectedButton--;
              this.buttonsEntities[this.selectedButton].setBkColor(this.selectedButtonColor);
            }
            return true;
          }
        break;

      case 'closePauseGame':
        this.destroy();
        return true;

      case 'exitGame':
        this.app.setModel(this.exitModel);
        return true;
    }

    return false;
  } // handleEvent

} // PauseGameEntity

export default PauseGameEntity;
