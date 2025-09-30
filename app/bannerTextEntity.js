/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
/**/
// begin code

export class BannerTextEntity extends AbstractEntity {

  constructor(parentEntity, fonts, x, y, width, height, text, penColor, bkColor, bannerLength) {
    super(parentEntity, x, y, width, height, penColor, bkColor);
    this.id = 'BannerTextEntity';

    this.fonts = fonts;
    this.text = text;
    this.bannerLength = bannerLength;
    this.bannerPosition = 0;

    this.app.layout.newDrawingCache(this, 0);
    this.app.layout.newDrawingCropCache(this);
  } // constructor

  drawEntity() {
    if (this.drawingCache[0].needToRefresh(this, this.bannerLength, this.height)) {
      if (this.bkColor != false) {
        this.app.layout.paintRect(this.drawingCache[0].ctx, 0, 0, this.bannerLength, this.height, this.bkColor);
      }
      this.cursorX = 1;
      for (var ch = 0; ch < this.text.length; ch++) {
        var charData = this.fonts.getCharData(this.text[ch], '1', 'left', 1);
        for (var x = 0; x < charData.data.length; x++) {
          this.app.layout.paintRect(this.drawingCache[0].ctx, this.cursorX+charData.data[x][0], charData.data[x][1], charData.data[x][2], charData.data[x][3], this.penColor);
        }
        this.cursorX += charData.width;
      }
    }
    this.app.layout.paintCropCache(this, 0, this.bannerPosition, 0, 0, 0);
  } // drawEntity

  cleanCache() {
    this.drawingCache[0].cleanCache();
  } // cleanCache

} // class BannerTextEntity

export default BannerTextEntity;
