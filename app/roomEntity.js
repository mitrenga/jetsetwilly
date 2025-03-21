/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class RoomEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, width, height);
    this.id = 'RoomEntity';

    this.bkColor = this.app.platform.colorByName('black');
    this.imageData = null;
  } // constructor

  drawEntity() {
    super.drawEntity();
  } // drawEntity

  setData(data) {
    var roomData = data['roomData'];
    this.bkColor = this.app.platform.zxColorByAttribut(this.app.hexToInt(roomData['bkColor']), 56, 8);


    // layout
    roomData['layout'].forEach((row, y) => {
      for (var x = 0; x < 32; x++) {
        var item = this.app.binToInt(this.app.hexToBin(row.substring(Math.floor(x/4)*2, Math.floor(x/4)*2+2)).substring(x%4*2, x%4*2+2));
        var idItem = ['background', 'floor', 'wall', 'nasty'][item];
        var attr = roomData['graphicData'][idItem].substring(0, 2);
        if (attr != roomData['bkColor']) {
          var spriteData = [];
          //if (['floor', 'wall'].includes(idItem)) {
          {
            var graphicData = roomData['graphicData'][idItem].substring(2, 18);
            for (var b = 0; b < 8; b++) {
              var line = this.app.hexToBin(graphicData.substring(b*2, b*2+2));
              for (var col = 0; col < line.length; col++) {
                if (line[col] == '1') {
                  spriteData.push({'x': col, 'y': b});
                }
              }
            }
            var penColor = this.app.platform.penColorByAttribut(this.app.hexToInt(attr)&63);
            var bkColor = this.app.platform.bkColorByAttribut(this.app.hexToInt(attr)&63);
            if (bkColor == this.app.platform.bkColorByAttribut(this.app.hexToInt(roomData['bkColor']))) {
              bkColor = false;
            }
            this.addEntity(new SpriteEntity(this, x*8, y*8, 8, 8, spriteData, penColor, bkColor));
          }
        }
      }
    });
    
    super.setData(data);
  } // setData
    

} // class RoomEntity

export default RoomEntity;
