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
    var color = this.app.platform.color(this.colorState*2+9);
    this.app.layout.paint(this, 0, 0, this.width, 3, color);
    this.app.layout.paint(this, 0, this.height-3, this.width, 3, color);
    this.app.layout.paint(this, 0, 0, 3, this.height, color);
    this.app.layout.paint(this, this.width-3, 0, 3, this.height, color);
  } // drawEntity

  loopEntity(timestamp) {
    this.colorState = 0;
    if (this.app.stack.flashState) {
      this.colorState = 1;
    }
  } // loopEntity

} // RoomSelectionEntity

export default RoomSelectionEntity;
