/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import TextEntity from '././svision/js/platform/canvas2D/textEntity.js';
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

    this.roomNameEntity = new TextEntity(this, this.app.fonts.zxFonts8x8, 0, 0, 32*8, 8, '', this.app.platform.colorByName('brightYellow'), this.app.platform.colorByName('brightBlack'), {align: 'center'});
    this.addEntity(this.roomNameEntity);
    this.addEntity(new AbstractEntity(this, 0, 8, 32*8, 7*8, false, this.app.platform.colorByName('black')));
    var colorsMap = {};
    for (var c = 0; c < 7; c++) {
      colorsMap[c] = this.app.platform.color(c+1);
    }
    var itemsLabel = 'Items collected';
    var itemsCounter = Object.keys(this.app.itemsCollected).length;
    if (this.app.extraGame) {
      itemsLabel = 'Items remaining';
      itemsCounter = this.app.totalItems-itemsCounter;
    }
    this.addEntity(new TextEntity(this, this.app.fonts.zxFonts8x8, 1*8, 2*8, 13*8, 8, itemsLabel, false, false, {penColorsMap: colorsMap}));
    this.itemsCollectedEntity = new TextEntity(this, this.app.fonts.zxFonts8x8Mono, 15*8, 2*8, 3*8, 8, itemsCounter.toString().padStart(3, '0'), this.app.platform.colorByName('white'), false, {});
    this.addEntity(this.itemsCollectedEntity);
    this.addEntity(new TextEntity(this, this.app.fonts.zxFonts8x8, 20*8, 2*8, 4*8, 8, 'Time', this.app.platform.colorByName('white'), false, {}));
    colorsMap = {};
    for (var c = 0; c < 7; c++) {
      colorsMap[c] = this.app.platform.color(7-c);
    }
    this.timeEntity = new TextEntity(this, this.app.fonts.zxFonts8x8, 25*8, 2*8, 6*8, 8, this.app.timeStr, false, false, {align: 'right', penColorsMap: colorsMap});
    this.addEntity(this.timeEntity);
    for (var l = 0; l < this.app.lives; l++) {
      this.liveEntities[l] = new SpriteEntity(this, l*16, 5*8, this.app.platform.colorByName(this.liveColors[l]), false, 0, 0);
      this.addEntity(this.liveEntities[l]);
    }
  } // init

} // GameInfoEntity

export default GameInfoEntity;
