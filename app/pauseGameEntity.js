/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { ButtonEntity } = await import('./svision/js/platform/canvas2D/buttonEntity.js?ver='+window.srcVersion);
const { MenuEntity } = await import('./svision/js/platform/canvas2D/menuEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
import ButtonEntity from './svision/js/platform/canvas2D/buttonEntity.js';
import MenuEntity from './svision/js/platform/canvas2D/menuEntity.js';
/**/
// begin code

export class PauseGameEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, title, exitModel) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'PauseGameEntity';

    this.title = title;
    this.exitModel = exitModel;
    this.menuItems = [
      {t1: 'RESUME GAME', event: {id: 'closePauseGame'}},
      {t1: 'SOUNDS', event: {id: 'changeSoundsState'}},
      {t1: 'MUSIC', event: {id: 'changeMusicState'}},
      {t1: 'EXIT GAME', event: {id: 'exitGame'}}
    ];
    this.menuOptions = {
      fonts: this.app.fonts.zxFonts8x8,
      leftMargin: 9,
      rightMargin: 9,
      topMargin: 8,
      itemHeight: 12,
      t1LeftMargin: 3,
      t1TopMargin: 2, 
      t2Width: 114,
      t2RightMargin: 3,
      t2TopMargin: 2, 
      textColor: this.app.platform.colorByName('black'),
      selectionTextColor: this.app.platform.colorByName('black'),
      selectionBarColor: '#dbdbdbff',
      hoverColor: '#0000001e',
      selectionHoverColor: '#efefefff',
      clickColor: '#0000002e',
      selectionClickColor: '#ffffffff'
    }
  } // constructor

  init() {
    super.init();
    this.addEntity(new AbstractEntity(this, 0, 0, this.width, this.height, false, this.app.platform.colorByName('brightWhite')));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 0, 0, this.width, 9, this.title, this.app.platform.colorByName('brightBlack'), false, {align: 'center', margin: 2}));
    this.addEntity(new MenuEntity(this, 1, 8, this.width-2, this.height-9, this.app.platform.colorByName('yellow'), this.menuOptions, this, this.getMenuData));
  } // init

  getMenuData(self, key, row) {
    switch (key) {
      
      case 'numberOfItems':
        return self.menuItems.length;

      case 't2':
        switch (row) {
          case 1:
            if (this.app.muted.sounds) {
              return 'MUTE';
            }
            return 'ON';
          case 2:
            if (this.app.muted.music) {
              return 'MUTE';
            }
            return 'ON';
        }
        break;

      default:
        if (key in self.menuItems[row]) {
          return self.menuItems[row][key];
        }
        break;

    }
    return '';
  } // getMenuData

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {

      case 'keyPress':
        switch (event.key) {
          case 'Escape':
            this.sendEvent(-1, 1, {id: 'continueGame'});
            this.destroy();
            return true;
        }
        break;

      case 'closePauseGame':
        this.sendEvent(-1, 1, {id: 'continueGame'});
        this.destroy();
        return true;
        
      case 'changeSoundsState':
        this.app.muted.sounds = !this.app.muted.sounds;
        this.app.audioManager.muteChannel('sounds', this.app.muted.sounds);
        this.app.audioManager.muteChannel('extra', this.app.muted.sounds);
        this.sendEvent(1, 0, {id: 'refreshMenu'});

        return true;

      case 'changeMusicState':
        this.app.muted.music = !this.app.muted.music;
        this.app.audioManager.muteChannel('music', this.app.muted.music);
        this.sendEvent(1, 0, {id: 'refreshMenu'});
        return true;

      case 'exitGame':
        this.app.setModel(this.exitModel);
        return true;
    }

    return false;
  } // handleEvent

} // PauseGameEntity

export default PauseGameEntity;
