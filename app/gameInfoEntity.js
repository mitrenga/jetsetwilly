const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
const { ZXColor } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxColor.js?ver='+window.srcVersion);
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

    this.roomNameEntity = new TextEntity(this, this.app.fonts.zxFonts8x8, 0, 0, 32*8, 8, '', ZXColor.brightYellow, ZXColor.brightBlack, {align: 'center'});
    this.addEntity(this.roomNameEntity);
    this.addEntity(new AbstractEntity(this, 0, 8, 32*8, 7*8, false, ZXColor.black));
    var penColorsMap = {};
    for (var c = 0; c < 7; c++) {
      penColorsMap[c] = ZXColor.color(c+1);
    }
    var itemsLabel = 'Items collected';
    var itemsCounter = Object.keys(this.app.itemsCollected).length;
    if (this.app.extraGame) {
      itemsLabel = 'Items remaining';
      itemsCounter = this.app.totalItems-itemsCounter;
    }
    // the first seven letters run through the palette (penColorsMap), the rest
    // is white — the pen colour; before 2026-09-07 it was false, and the rest
    // came out white only because DrawingCache.paint(false) kept the last colour
    this.addEntity(new TextEntity(this, this.app.fonts.zxFonts8x8, 1*8, 2*8, 13*8, 8, itemsLabel, ZXColor.white, false, {penColorsMap: penColorsMap}));
    this.itemsCollectedEntity = new TextEntity(this, this.app.fonts.zxFonts8x8Mono, 15*8, 2*8, 3*8, 8, itemsCounter.toString().padStart(3, '0'), ZXColor.white, false, {});
    this.addEntity(this.itemsCollectedEntity);
    this.addEntity(new TextEntity(this, this.app.fonts.zxFonts8x8, 20*8, 2*8, 4*8, 8, 'Time', ZXColor.white, false, {}));
    penColorsMap = {};
    for (var c = 0; c < 7; c++) {
      penColorsMap[c] = ZXColor.color(7-c);
    }
    // seven colours for seven characters; an eighth ("12:00 am") is white
    this.timeEntity = new TextEntity(this, this.app.fonts.zxFonts8x8, 25*8, 2*8, 6*8, 8, this.app.timeStr, ZXColor.white, false, {align: 'right', penColorsMap: penColorsMap});
    this.addEntity(this.timeEntity);
    for (var l = 0; l < this.app.lives; l++) {
      this.liveEntities[l] = new SpriteEntity(this, l*16, 5*8, ZXColor[this.liveColors[l]], false, 0, 0);
      this.addEntity(this.liveEntities[l]);
    }
  } // init

} // GameInfoEntity
