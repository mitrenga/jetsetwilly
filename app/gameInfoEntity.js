/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import ZXTextEntity from '././svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class GameInfoEntity extends AbstractEntity {
  
  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'GameInfoEntity';
    this.roomNameEntity = null;
    this.itemsCollectedEntity = null;
    this.liveEntities = [];
    this.liveColors = ['brightCyan', 'yellow', 'green', 'blue', 'cyan', 'brightMagenta', 'brightGreen'];
    this.timeEntity = null;
  } // constructor

  init() {
    super.init();

    this.roomNameEntity = new ZXTextEntity(this, 0, 0, 32*8, 8, '', this.app.platform.colorByName('brightYellow'), this.app.platform.colorByName('brightBlack'), 0, true);
    this.roomNameEntity.justify = 2;
    this.addEntity(this.roomNameEntity);
    this.addEntity(new AbstractEntity(this, 0, 8, 32*8, 7*8, false, this.app.platform.colorByName('black')));
    var itemsCollectedLabelEntity = new ZXTextEntity(this, 1*8, 2*8, 13*8, 8, 'Items collected', false, false, 0, true);
    itemsCollectedLabelEntity.penColorsMap = {};
    for (var c = 0; c < 7; c++) {
      itemsCollectedLabelEntity.penColorsMap[c] = this.app.platform.color(c+1);
    }
    this.addEntity(itemsCollectedLabelEntity);
    this.itemsCollectedEntity = new ZXTextEntity(this, 15*8, 2*8, 3*8, 8, Object.keys(this.app.itemsCollected).length.toString().padStart(3, '0'), this.app.platform.colorByName('white'), false, 0, true);
    this.addEntity(this.itemsCollectedEntity);
    this.addEntity(new ZXTextEntity(this, 20*8, 2*8, 4*8, 8, 'Time', this.app.platform.colorByName('white'), false, 0, true));
    this.timeEntity = new ZXTextEntity(this, 25*8, 2*8, 6*8, 8, this.app.timeStr, false, false, 0, true);
    this.timeEntity.justify = 1;
    this.timeEntity.penColorsMap = {};
    for (var c = 0; c < 7; c++) {
      this.timeEntity.penColorsMap[c] = this.app.platform.color(7-c);
    }
    this.addEntity(this.timeEntity);
    for (var l = 0; l < this.app.lives; l++) {
      this.liveEntities[l] = new SpriteEntity(this, l*16, 5*8, this.app.platform.colorByName(this.liveColors[l]), false, 0, 0);
      this.addEntity(this.liveEntities[l]);
    }
  } // init

} // class GameInfoEntity

export default GameInfoEntity;
