/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
/**/
// begin code

export class TriangleEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, snap, data) {
    super(parentEntity, x, y, width, height);
    this.id = 'TriangleEntity';

    this.bkColor = false;
    this.snap = snap;
    this.data = data;
  } // constructor

  drawEntity() {
    super.drawEntity();
    
    if (this.data != null) {
      var xPoint = 0;
      var x = this.data['conversion'][this.snap]['xBegin'];
      do {
        var yPoint = 0;
        var y = this.data['conversion'][this.snap]['yBegin'];
        do {
          var color = false;
          switch (this.data['sprite'][y][x]) {
            case 'x':
              color = this.data['colors'][this.data['conversion'][this.snap]['xColor']];
              break;
            case '+':
              color = this.data['colors'][this.data['conversion'][this.snap]['+Color']];
              break;
            case '-':
              color = this.data['colors'][this.data['conversion'][this.snap]['-Color']];
              break;
          }
          if (color !== false) {
            if (this.data['conversion'][this.snap]['switchCoordinates'] == true) {
              this.app.layout.paint(this, yPoint, xPoint, 1, 1, color);
            } else {
              this.app.layout.paint(this, xPoint, yPoint, 1, 1, color);
            }
          }
          y += this.data['conversion'][this.snap]['yStep'];
          yPoint++;
        } while (y != this.data['conversion'][this.snap]['yEnd'])
        x += this.data['conversion'][this.snap]['xStep'];
        xPoint++;
      } while (x != this.data['conversion'][this.snap]['xEnd'])
    }
  } // drawEntity

} // class TriangleEntity

export default TriangleEntity;
