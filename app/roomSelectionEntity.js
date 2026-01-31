/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
/**/
// begin code

export class RoomSelectionEntity extends AbstractEntity {
  
  constructor(parentEntity, x, y) {
    super(parentEntity, x, y, 70, 43, false, false);
    this.id = 'RoomSelectionEntity';

    this.colorState = 0;
  } // constructor

  drawEntity() {
    if (this.x >= this.parentEntity.width || this.y >= this.parentEntity.height) {
      return;
    }
    if (this.x+this.width <= 0 || this.y+this.height <= 0) {
      return;
    }

    var cropX = 0;
    var cropY = 0;
    var cropWidth = this.width;
    var cropHeight = this.height;
    if (this.x < 0) {
      cropX = -this.x;
      cropWidth = this.width-cropX;
    }
    if (this.y < 0) {
      cropY = -this.y;
      cropHeight = this.height-cropY;
    }
    if (this.x+this.width > this.parentEntity.width) {
      cropWidth = this.parentEntity.width-this.x;
    }
    if (this.y+this.height > this.parentEntity.height) {
      cropHeight = this.parentEntity.height-this.y;
    }

    var color = this.app.platform.color(this.colorState*2+9);

    // top
    if (cropY < 4) {
      this.app.layout.paint(this, cropX, cropY, cropWidth, 3-cropY, color);
    }
    // bottom
    if (this.height-cropHeight-cropY < 4) {
      this.app.layout.paint(this, cropX, this.height-3, cropWidth, Math.min(3, 3-this.height+cropHeight+cropY), color);
    }
    // left
    if (cropX < 4) {
      this.app.layout.paint(this, cropX, cropY, 3-cropX, cropHeight, color);
    }
    // right
    if (this.width-cropWidth-cropX < 4) {
      this.app.layout.paint(this, this.width-3, cropY, Math.min(3, 3-this.width+cropWidth+cropX), cropHeight, color);
    }
  } // drawEntity

  loopEntity(timestamp) {
    this.colorState = 0;
    if (this.app.stack.flashState) {
      this.colorState = 1;
    }
  } // loopEntity

} // RoomSelectionEntity

export default RoomSelectionEntity;
