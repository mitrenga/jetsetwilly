/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { DrawingCache } = await import('./svision/js/platform/canvas2D/drawingCache.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import DrawingCache from './svision/js/platform/canvas2D/drawingCache.js';
/**/
// begin code

export class GameAreaEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, roomNumber) {
    super(parentEntity, x, y, width, height);
    this.id = 'GameAreaEntity';

    this.roomNumber = roomNumber;
    this.data = null;

    this.app.layout.newDrawingCache(this, 0); 
    this.graphicCache = {};
    this.staticKinds = ['floor', 'wall', 'nasty'];
  } // constructor

  drawEntity() {
    if (this.drawingCache[0].needToRefresh(this, this.width, this.height)) {
      if (this.data) {
        this.app.layout.paintRect(this.drawingCache[0].ctx, 0, 0, this.width, this.height, this.app.platform.zxColorByAttr(this.app.hexToInt(this.data.bkColor), 56, 8));
        this.data.layout.forEach((row, r) => {
          for (var column = 0; column < 32; column++) {
            var item = this.app.binToInt(this.app.hexToBin(row.substring(Math.floor(column/4)*2, Math.floor(column/4)*2+2)).substring(column%4*2, column%4*2+2));
            var idItem = [false, 'floor', 'wall', 'nasty'][item];
            if (idItem !== false) {
              var attr = this.data.graphicData[idItem].substring(0, 2);
              if (this.staticKinds.includes(idItem)) {
                if (this.graphicCache[idItem].needToRefresh(this, 8, 8)) {
                  var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(attr));
                  var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(attr)&63);
                  if (bkColor == this.app.platform.bkColorByAttr(this.app.hexToInt(this.data.bkColor))) {
                    bkColor = false;
                  }
                  if (bkColor != false) {
                    this.app.layout.paintRect(this.graphicCache[idItem].ctx, 0, 0, 8, 8, bkColor);
                  }
                  for (var y = 0; y < 8; y++) {
                    var spriteLine = this.app.hexToBin(this.data.graphicData[idItem].substring((y+1)*2, (y+1)*2+2));
                    for (var x = 0; x < 8; x++) {
                      if (spriteLine[x] == '1') {
                        this.app.layout.paintRect(this.graphicCache[idItem].ctx, x, y, 1, 1, penColor);
                      }
                    }
                  }
                }
              }
              this.drawingCache[0].ctx.drawImage(this.graphicCache[idItem].canvas, column*8*this.app.layout.ratio, r*8*this.app.layout.ratio);
            }
          }
        });
      }
    }

    this.app.layout.paintCache(this, 0);
    super.drawSubEntities();
  } // drawEntity

  setData(data) {
    this.data = data;
    this.drawingCache[0].cleanCache();
    this.graphicCache = {};
    Object.keys(data.graphicData).forEach((key) => {
      if (this.staticKinds.includes(key)) {
        this.graphicCache[key] = new DrawingCache(this.app);
      }
    });
  } // setData
    
} // class GameAreaEntity

export default GameAreaEntity;
