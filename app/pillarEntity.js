/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
/**/
// begin code

export class PillarEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, penColor, data) {
    super(parentEntity, x, y, width, height, penColor, false);
    this.id = 'PillarEntity';

    this.spriteHeight = data.height;
    this.pixels = [];
    for (var y = 0; y < data.height; y++) {
      this.pixels[y] = [];
    }
    for (var y = 0; y < data.height; y++) {
      for (var x = 0; x < data.width; x++) {
        if (data.sprite[0][y][x] == '#') {
          this.pixels[y].push(x);
        }
      }
    }
  } // constructor

  drawEntity() {
    var spriteRow = this.spriteHeight-1;
    for (var y = this.height-1; y >= 0; y--) {
      for (var p = 0; p < this.pixels[spriteRow].length; p++) {
        this.app.layout.paint(this, this.pixels[spriteRow][p], y, 1, 1, this.penColor);
      }
      spriteRow--;
      if (spriteRow < 0) {
        spriteRow = this.spriteHeight-1;
      }
    }
  } // drawEntity

} // class PillarEntity

export default PillarEntity;
