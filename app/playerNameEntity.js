/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { InputEntity } = await import('./svision/js/platform/canvas2D/inputEntity.js?ver='+window.srcVersion);
const { KeyboardEntity } = await import('./svision/js/platform/canvas2D/keyboardEntity.js?ver='+window.srcVersion);
const { ButtonEntity } = await import('./svision/js/platform/canvas2D/buttonEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js//abstractEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
import InputEntity from './svision/js/platform/canvas2D/inputEntity.js';
import KeyboardEntity from './svision/js/platform/canvas2D/keyboardEntity.js';
import ButtonEntity from './svision/js/platform/canvas2D/buttonEntity.js';
/**/
// begin code

export class PlayerNameEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, autoStartGame) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'PlayerNameEntity';    

    this.maxNameChars = 15;
    this.inputEntity = null;
    this.charsCounter = null;
    this.autoStartGame = autoStartGame;

    this.keyboardLayout = {
      options: {
        fnKeys: {
          '∅': false,
          '⏎': 'Enter',
          '⌫': 'Backspace',
          '←': 'ArrowLeft',
          '↓': 'ArrowDown',
          '↑': 'ArrowUp',
          '➔': 'ArrowRight'
        },
        shiftKeys: {
          '⇧': {activeBkColor: this.app.platform.colorByName('yellow')},
          '⌥': {activeBkColor: this.app.platform.colorByName('yellow')}
        },
        buttons: {
          default: {
            width: 16, height: 16, keySpacing: 1, align: 'center', topMargin: 4,
            fonts: this.app.fonts.zxFonts8x8Keys,
            penColor: this.app.platform.colorByName('black'),
            bkColor: this.app.platform.colorByName('white')
          },

          '←': {fonts: this.app.fonts.fonts5x5, topMargin: 6},
          '↓': {fonts: this.app.fonts.fonts5x5, topMargin: 6},
          '↑': {fonts: this.app.fonts.fonts5x5, topMargin: 6},
          '➔': {fonts: this.app.fonts.fonts5x5, topMargin: 6},
          '⌫': {label: 'DELETE', width: 25, fonts: this.app.fonts.fonts3x3, topMargin: 7},
          '⏎': {label: 'ENTER', width: 23, fonts: this.app.fonts.fonts3x3, topMargin: 7},
          '⇧': {label: 'CAPS\nSHIFT', width: 23, fonts: this.app.fonts.fonts3x3},
          '⌥': {label: 'SYMBOL\nSHIFT', width: 25, penColor: this.app.platform.colorByName('brightRed'), fonts: this.app.fonts.fonts3x3},
          ' ': {label: 'SPACE', width: 25, fonts: this.app.fonts.fonts3x3, topMargin: 7},
        },
        rows: [{shiftX: 0}, {shiftX: 9}, {shiftX: 18}, {shiftX: 0}]
      },
      keymap: {
        ' ': [
          ['1','2','3','4','5','6','7','8','9','0'],
          ['q','w','e','r','t','y','u','i','o','p'],
          ['a','s','d','f','g','h','j','k','l', '⏎'],
          ['⇧', 'z','x','c','v','b','n','m', '⌥', ' ']
        ],
        '⇧': [
          ['∅','∅','∅','∅','←','↓','↑','➔','∅','⌫'],
          ['Q','W','E','R','T','Y','U','I','O','P'],
          ['A','S','D','F','G','H','J','K','L', '⏎'],
          ['⇧', 'Z','X','C','V','B','N','M', '⌥', ' ']
        ],
        '⌥': [
          ['!','@','#','$','%','&','\'','(',')','_'],
          ['~','∅','∅','<','>','{','}','∅',';','"'],
          ['|','∅','∅','[',']','∅','-','+','=', '⏎'],
          ['⇧', ':','£','?','/','*',',','.', '⌥', ' ']
        ]
      }
    };
  } // constructor

  init() {
    super.init();

    this.addEntity(new AbstractEntity(this, 0, 6, this.width, this.height-6, false, this.app.platform.colorByName('black')));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 0, 0, 63, 7, 'PLAYER NAME', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('black'), {topMargin: 1, leftMargin: 2}));
    this.addEntity(new AbstractEntity(this, 1, 7, this.width-2, this.height-8, false, this.app.platform.colorByName('brightWhite')));

    this.addEntity(new TextEntity(this, this.app.fonts.zxFonts8x8, 4, 18, this.width-8, 8, 'Enter your player name:', this.app.platform.colorByName('black'), false, {}));
    this.inputEntity = new InputEntity(this.app, this.app.fonts.zxFonts8x8, 4, 28, this.width-38, 8, 'playerName', this.app.playerName, this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('magenta'), this.maxNameChars, {leftMargin: 1});
    this.addEntity(this.inputEntity);
    this.charsCounter = new TextEntity(this, this.app.fonts.fonts5x5, this.width-34, 28, 30, 8, this.inputEntity.value.length+'/'+this.maxNameChars, this.app.platform.colorByName('white'), this.app.platform.colorByName('magenta'), {align: 'right', rightMargin: 1, topMargin: 2});
    this.addEntity(this.charsCounter);

    this.addEntity(new KeyboardEntity(this, 4, 42, 194, 67, this.keyboardLayout, false));

    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, this.width-98, this.height-16, 46, 13, 'CANCEL', 'cancel', ['Escape'], this.app.platform.colorByName('white'), this.app.platform.colorByName('red'), {align: 'center', margin: 4}));
    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, this.width-50, this.height-16, 46, 13, 'OK', 'ok', ['Enter'], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('green'), {align: 'center', margin: 4}));
  } // init

  handleEvent(event) {
    switch (event.id) { 
      case 'cancel':
        this.destroy();
        return true;

      case 'changeInputValue':
        if (event.inputId == 'playerName') {
          this.charsCounter.setText(this.inputEntity.value.length+'/'+this.maxNameChars);
          return true;
        }
        break;

      case 'ok':
        if (this.inputEntity.value.length > 0) {
          this.app.playerName = this.inputEntity.value;
          this.app.setCookie('playerName', this.app.playerName);
          if (this.autoStartGame) {
            this.app.setModel('MainModel');
          } else {
            this.sendEvent(0, 0, {'id': 'refreshMenu'});
            this.destroy();
          }
        }
        return true;
    }

    return super.handleEvent(event);
  } // handleEvent

} // class PlayerNameEntity

export default PlayerNameEntity;
