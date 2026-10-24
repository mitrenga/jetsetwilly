const { RasterEntity } = await import('./svision/js/platform/canvas2D/rasterEntity.js?ver='+window.srcVersion);
const { Tool } = await import('./svision/js/tool.js?ver='+window.srcVersion);
const { ZXColor } = await import('./svision/js/platform/canvas2D/zx/zxColor.js?ver='+window.srcVersion);
// begin code

/**
 * The title picture, built the way the original builds it: 16 rows of
 * attribute bytes (data/intro.json) and, for every cell, a shape chosen by the
 * attribute's code — the sloping edges of the letters are two kinds of
 * staircase, mirrored on odd columns. The colours cycle by attribute
 * arithmetic while the menu runs (`attrStep`, set by MainModel every frame),
 * and at rest the attribute 211 flashes with the machine's FLASH phase.
 *
 * It is a {@link RasterEntity}: the picture is painted into the frame with
 * {@link RasterEntity#paintRect} and repainted only when `attrStep` or the
 * FLASH phase changes — the setter of `attrStep` invalidates the frame, so the
 * model keeps assigning it as before. Until 2026-09-07 the same 500-odd
 * rectangles went straight onto the main canvas on every display frame.
 *
 * The attributes come with appData (db/appData.php) and are read from
 * localStorage in init(), synchronously, the same way every room reads its own
 * file. The children (the sliding text, the menu box) are drawn over it.
 */
export class MainImageEntity extends RasterEntity {

  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, width, height);
    this.id = 'MainImageEntity';

    /** 16 rows of 32 attribute bytes as hex, from data/intro.json */
    this.attributes = null;
    this.attrStepValue = 0;
    // attribute 211 flashes at rest
    this.watchFlash = true;
  } // constructor

  init() {
    super.init();
    this.fetchData('intro.data', {key: 'intro', when: 'required'}, {});
  } // init

  /**
   * Takes the attributes when they arrive and passes whatever comes on to the
   * children, as every entity does.
   * @param {Object} data - {url, source, data}; the picture has `data.attributes`.
   */
  setData(data) {
    if (data && data.data && data.data.attributes) {
      this.attributes = data.data.attributes;
      this.invalidate();
    }
    super.setData(data);
  } // setData

  /**
   * The step of the colour cycle, 0 at rest. Assigning a different value
   * repaints the picture on the next draw; assigning the same one costs nothing.
   * @type {number}
   */
  get attrStep() {
    return this.attrStepValue;
  }

  set attrStep(value) {
    if (value !== this.attrStepValue) {
      this.attrStepValue = value;
      this.invalidate();
    }
  }

  /**
   * An attribute after `attrStep` steps of the colour cycle: ink and paper each
   * advanced by the step, modulo 8, bright and flash untouched.
   * @param {number} attr - The attribute byte.
   * @returns {number} The cycled attribute.
   */
  cycled(attr) {
    if (this.attrStepValue == 0) {
      return attr;
    }
    return (((attr&56)+(this.attrStepValue<<3))&56)+(((attr&7)+this.attrStepValue)&7);
  } // cycled

  /**
   * Nothing is drawn before the attributes have arrived.
   */
  drawEntity() {
    if (this.attributes === null) {
      return;
    }
    super.drawEntity();
  } // drawEntity

  /**
   * Paints the picture: the ground in the cycled colour of attribute 0, then
   * every non-empty cell's paper and its shape in its ink.
   * @param {Uint8ClampedArray} data - The RGBA bytes of the frame.
   */
  paintRaster(data) {
    this.pixels.fill(RasterEntity.colorValue(ZXColor.bkAttrColor(this.cycled(0))));
    for (var block = 0; block < 2; block++) {
      for (var row = 0; row < 8; row++) {
        for (var column = 0; column < 32; column++) {
          var hexAttr = this.attributes[block*8+row].substring(column*2, column*2+2);
          if (hexAttr == '00') {
            continue;
          }
          var attr = Tool.hexToInt(hexAttr);
          if (this.attrStepValue == 0) {
            if (this.flashState && attr == 211) {
              attr = 218;
            }
          } else {
            attr = this.cycled(attr);
          }
          var bkColor = ZXColor.bkAttrColor(attr);
          var penColor = ZXColor.penAttrColor(attr);
          if (hexAttr == '2C') {
            var tmpColor = bkColor;
            bkColor = penColor;
            penColor = tmpColor;
          }
          var x = column*8, y = (block*8+row)*8;
          this.paintRect(x, y, 8, 8, bkColor);
          switch (hexAttr) {
            case '05':
            case '08':
            case '29':
            case '2C':
              // a staircase growing downwards; mirrored on odd columns
              if (column%2 == 0) {
                this.paintRect(x, y, 2, 1, penColor);
                this.paintRect(x, y+1, 4, 1, penColor);
                this.paintRect(x, y+2, 6, 1, penColor);
                this.paintRect(x, y+3, 8, 5, penColor);
              } else {
                this.paintRect(x, y+4, 2, 1, penColor);
                this.paintRect(x, y+5, 4, 1, penColor);
                this.paintRect(x, y+6, 6, 1, penColor);
                this.paintRect(x, y+7, 8, 1, penColor);
              }
              break;

            case '04':
            case '0C':
            case '25':
            case '28':
              // a staircase shrinking downwards; mirrored on odd columns
              if (column%2 == 0) {
                this.paintRect(x, y, 8, 5, penColor);
                this.paintRect(x, y+5, 6, 1, penColor);
                this.paintRect(x, y+6, 4, 1, penColor);
                this.paintRect(x, y+7, 2, 1, penColor);
              } else {
                this.paintRect(x, y, 8, 1, penColor);
                this.paintRect(x, y+1, 6, 1, penColor);
                this.paintRect(x, y+2, 4, 1, penColor);
                this.paintRect(x, y+3, 2, 1, penColor);
              }
              break;
          }
        }
      }
    }
  } // paintRaster

} // MainImageEntity
