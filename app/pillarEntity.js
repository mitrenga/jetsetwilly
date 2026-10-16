const { RasterEntity } = await import('./svision/js/platform/canvas2D/rasterEntity.js?ver='+window.srcVersion);
// begin code

/**
 * The pillar of the game over screen: one sprite pattern repeated upwards from
 * the bottom edge, in a column whose height the model changes every frame as
 * the boot comes down (`height = shoeEntity.y`).
 *
 * It is a {@link RasterEntity}: the column is painted into the frame from the
 * bottom row up, and because the height changes, `preparePaint()` sees a
 * different size on every frame of the animation and repaints — the same work
 * as before, once into a buffer instead of one `paint()` per pixel on the main
 * canvas. Nothing is drawn while the column has no height yet: an `ImageData`
 * of zero rows cannot be made.
 */
export class PillarEntity extends RasterEntity {

  /**
   * @param {AbstractEntity} parentEntity - The parent entity.
   * @param {number} x - X position relative to the parent.
   * @param {number} y - Y position relative to the parent.
   * @param {number} width - Width in pixels (the sprite's).
   * @param {number} height - Starting height, 0 — the model grows it.
   * @param {string} penColor - The colour of the set pixels.
   * @param {Object} data - The pillar's graphics data (width, height, sprite).
   */
  constructor(parentEntity, x, y, width, height, penColor, data) {
    super(parentEntity, x, y, width, height, penColor, false);
    this.id = 'PillarEntity';

    this.spriteHeight = data.height;
    /** per sprite row, the x positions of its set pixels */
    this.rows = [];
    for (var y = 0; y < data.height; y++) {
      this.rows[y] = [];
      for (var x = 0; x < data.width; x++) {
        if (data.sprite[0][y][x] == '#') {
          this.rows[y].push(x);
        }
      }
    }
  } // constructor

  /**
   * Paints the column: the sprite's last row on the bottom line, the one above
   * it on the line above, and round again to the top of the column.
   * @param {Uint8ClampedArray} data - The RGBA bytes of the frame.
   */
  paintRaster(data) {
    var px = this.pixels;
    var width = this.imageData.width;
    var value = RasterEntity.colorValue(this.penColor);
    px.fill(0);
    var spriteRow = this.spriteHeight-1;
    for (var y = this.height-1; y >= 0; y--) {
      var row = this.rows[spriteRow];
      for (var p = 0; p < row.length; p++) {
        px[y*width+row[p]] = value;
      }
      spriteRow--;
      if (spriteRow < 0) {
        spriteRow = this.spriteHeight-1;
      }
    }
  } // paintRaster

  drawEntity() {
    if (this.height <= 0 || this.width <= 0) {
      return;
    }
    super.drawEntity();
  } // drawEntity

} // PillarEntity
