/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { MiniTextEntity } = await import('./svision/js/platform/canvas2D/miniTextEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js//abstractEntity.js';
import MiniTextEntity from './svision/js/platform/canvas2D/miniTextEntity.js';
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
  } // init

  handleEvent(event) {
    switch (event['id']) {
      case 'mouseClick':
        this.destroy();
        return true;
    }

    return super.handleEvent(event);
  } // handleEvent

} // class PlayerNameEntity

export default PlayerNameEntity;
