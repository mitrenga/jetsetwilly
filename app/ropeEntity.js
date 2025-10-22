/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
/**/
// begin code

export class RopeEntity extends AbstractEntity {
  
  constructor(parentEntity, x, y, width, height, penColor) {
    super(parentEntity, x, y, width, height, penColor, false);
    this.id = 'RopeEntity';
  } // constructor

  drawEntity() {
    this.app.layout.paint(this, 0, 0, this.width, this.height, this.penColor);
  } // drawEntity

} // RopeEntity

export default RopeEntity;
