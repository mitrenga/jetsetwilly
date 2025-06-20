/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
/**/
// begin code

export class MainImageEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, width, height);
    this.id = 'MainImageEntity';
    this.attrStep = 0;

    this.introImageAttributes = [
      "0000000000000000000000000000000000000000000000000000000000000000",
      "0000000000000000000000000000000000000000000000000000000000000000",
      "0000000000000000000000000000000000002828050500000000000000000000",
      "00000000D3D3D300D3D3D300D3D3D30028D3D3D325D3D3D300D3D3D300000000",
      "0000000000D30000D300000000D328282DD3252524D300000000D30000000000",
      "0000000000D30000D3D3D30028D32D2D25D3D3D324D3D3D30000D30000000000",
      "0000000000D30000D30028282DD3252524240CD324D300000000D30000000000",
      "00000000D3D30000D3D3D32D25D3242404D3D3D324D3D3D30000D30000000000",
      "000000000000000029292D2D2C2C040400000909242400000000000000000000",
      "0000000000000000090929292D2D050500000909242400000000000000000000",
      "000000000000D3000808D309D329D32D0505D30924D3000000D3000000000000",
      "000000000000D3000000D308D309D3292D2DD30924D3000000D3000000000000",
      "000000000000D300D300D300D308D3092929D30924D3D3D3D3D3000000000000",
      "000000000000D300D300D300D300D3080909D309242400D30000000000000000",
      "000000000000D3D3D3D3D300D300D3D3D308D3D3D32400D30000000000000000",
      "0000000000000000000000000000000000000808040400000000000000000000"
    ]; // introImageAttributes
  } // constructor
  
  drawEntity() {
    var attr = 0;
    if (this.attrStep > 0) {
      attr = (((attr&56)+(this.attrStep<<3))&56)+(((attr&7)+this.attrStep)&7);
    }
    this.app.layout.paint(this, 0, 0, this.width, this.height, this.app.platform.bkColorByAttr(attr));
    for (var block = 0; block < 2; block++) {
      for (var row = 0; row < 8; row++) {
        for (var column = 0; column < 32; column++) {
          var hexAttr = this.introImageAttributes[block*8+row].substring(column*2, column*2+2);
          if (hexAttr != '00') {
            attr = this.app.hexToInt(hexAttr);
            if (this.attrStep == 0) {
              if (this.app.stack.flashState) {
                if (attr == 211) {
                  attr = 218;
                }
              }
            } else {
              attr = (((attr&56)+(this.attrStep<<3))&56)+(((attr&7)+this.attrStep)&7);
            }
            var bkColor = this.app.platform.bkColorByAttr(attr);
            var penColor = this.app.platform.penColorByAttr(attr);
            if (hexAttr == '2C') {
              var tmpColor = bkColor;
              bkColor = penColor;
              penColor = tmpColor;
            }
            this.app.layout.paint(this, column*8, (block*8+row)*8, 8, 8, bkColor);
            switch (hexAttr) {
              case '05':
              case '08':
              case '29':
              case '2C':
                if (column%2 == 0) {
                  this.app.layout.paint(this, column*8, (block*8+row)*8, 2, 1, penColor);
                  this.app.layout.paint(this, column*8, (block*8+row)*8+1, 4, 1, penColor);
                  this.app.layout.paint(this, column*8, (block*8+row)*8+2, 6, 1, penColor);
                  this.app.layout.paint(this, column*8, (block*8+row)*8+3, 8, 5, penColor);
                } else {
                  this.app.layout.paint(this, column*8, (block*8+row)*8+4, 2, 1, penColor);
                  this.app.layout.paint(this, column*8, (block*8+row)*8+5, 4, 1, penColor);
                  this.app.layout.paint(this, column*8, (block*8+row)*8+6, 6, 1, penColor);
                  this.app.layout.paint(this, column*8, (block*8+row)*8+7, 8, 1, penColor);
                }
                break;

              case '04':
              case '0C':
              case '25':
              case '28':
                if (column%2 == 0) {
                  this.app.layout.paint(this, column*8, (block*8+row)*8, 8, 5, penColor);
                  this.app.layout.paint(this, column*8, (block*8+row)*8+5, 6, 1, penColor);
                  this.app.layout.paint(this, column*8, (block*8+row)*8+6, 4, 1, penColor);
                  this.app.layout.paint(this, column*8, (block*8+row)*8+7, 2, 1, penColor);
                } else {
                  this.app.layout.paint(this, column*8, (block*8+row)*8, 8, 1, penColor);
                  this.app.layout.paint(this, column*8, (block*8+row)*8+1, 6, 1, penColor);
                  this.app.layout.paint(this, column*8, (block*8+row)*8+2, 4, 1, penColor);
                  this.app.layout.paint(this, column*8, (block*8+row)*8+3, 2, 1, penColor);
                }
                break;
            }
          }
        }
      }
    }
    super.drawSubEntities();
  } // drawEntity

} // class MainImageEntity

export default MainImageEntity;
