/**/
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
const { DrawingCache } = await import('./svision/js/platform/canvas2D/drawingCache.js?ver='+window.srcVersion);
/*/
import ZXTextEntity from './svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
import DrawingCache from './svision/js/platform/canvas2D/drawingCache.js';
/**/
// begin code

export class BannerTextEntity extends ZXTextEntity {

  constructor(parentEntity, x, y, width, height, text, penColor, bkColor) {
    super(parentEntity, x, y, width, height, text, penColor, bkColor, 0, false);
    this.id = 'BannerTextEntity';
    this.bannerPosition = 0;
  } // constructor

  drawEntity() {
    if (this.drawingCache[0].needToRefresh(this, this.text.length*8, this.height)) {
      if (this.bkColor != false) {
        this.app.layout.paintRect(this.drawingCache[0].ctx, 0, 0, this.text.length*8, this.height, this.bkColor);
      }
      this.cursorX = 0;
      for (var ch = 0; ch < this.getTextLength(); ch++) {
        var charData = this.getCharData(this.getTextChar(ch), '1');
        for (var x = 0; x < charData.data.length; x++) {
          this.app.layout.paintRect(this.drawingCache[0].ctx, this.cursorX+charData.data[x][0], charData.data[x][1], charData.data[x][2], charData.data[x][3], this.penColor);
        }
        this.cursorX += charData.width;
      }
    }
    if (this.drawingCropCache == null) {
      this.drawingCropCache = new DrawingCache(this.app);
      this.drawingCropCache.init(this.width, this.height);
    }
    this.drawingCropCache.ctx.clearRect(0, 0, this.drawingCropCache.canvas.width, this.drawingCropCache.canvas.height);
    this.drawingCropCache.ctx.drawImage(this.drawingCache[0].canvas, -this.bannerPosition*this.app.layout.ratio, 0);
    this.app.stack.ctx.drawImage(this.drawingCropCache.canvas, (this.parentX+this.x)*this.app.layout.ratio, (this.parentY+this.y)*this.app.layout.ratio);
  } // drawEntity

} // class BannerTextEntity

export default BannerTextEntity;
