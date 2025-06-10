/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class RoomEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, roomNumber) {
    super(parentEntity, x, y, width, height);
    this.id = 'RoomEntity';

    this.roomNumber = roomNumber;
    this.bkColor = this.app.platform.colorByName('black');
    this.imageData = null;
  } // constructor

  drawEntity() {
    super.drawEntity();
  } // drawEntity

  setData(data) {
    this.bkColor = this.app.platform.zxColorByAttribute(this.app.hexToInt(data.bkColor), 56, 8);

    // layout
    data.layout.forEach((row, y) => {
      for (var x = 0; x < 32; x++) {
        var item = this.app.binToInt(this.app.hexToBin(row.substring(Math.floor(x/4)*2, Math.floor(x/4)*2+2)).substring(x%4*2, x%4*2+2));
        var idItem = [false, 'floor', 'wall', 'nasty'][item];
        if (idItem !== false) {
          var attr = data.graphicData[idItem].substring(0, 2);
          //if (['floor', 'wall'].includes(idItem)) {
          {
            var penColor = this.app.platform.penColorByAttribute(this.app.hexToInt(attr));
            var bkColor = this.app.platform.bkColorByAttribute(this.app.hexToInt(attr)&63);
            if (bkColor == this.app.platform.bkColorByAttribute(this.app.hexToInt(data.bkColor))) {
              bkColor = false;
            }
            var layoutEntity = new SpriteEntity(this, x*8, y*8, penColor, bkColor, 0, 0);
            this.addEntity(layoutEntity);
            layoutEntity.setGraphicsDataFromHexStr(idItem, data.graphicData[idItem].substring(2, 18));
          }
        }
      }
    });

    // ramp
    if ('ramp' in data.graphicData) {
      var rampData = data.graphicData.ramp;
      var attr = rampData.data.substring(0, 2);
      var penColor = this.app.platform.penColorByAttribute(this.app.hexToInt(attr));
      var bkColor = this.app.platform.bkColorByAttribute(this.app.hexToInt(attr)&63);
      if (bkColor == this.app.platform.bkColorByAttribute(this.app.hexToInt(data.bkColor))) {
        bkColor = false;
      }
      var direction = 0;
      switch (rampData.direction) {
        case 'left':
          direction = -1;
          break;
        case 'right':
          direction = 1;
          break;
        }
      for (var pos = 0; pos < this.app.hexToInt(rampData.length); pos++) {
        var rampEntity = new SpriteEntity(this, (rampData.location.x+pos*direction)*8, (rampData.location.y-pos)*8, penColor, bkColor, 0, 0);
        this.addEntity(rampEntity);
        rampEntity.setGraphicsDataFromHexStr('ramp', rampData.data.substring(2, 18));
      }
    }

    // conveyor
    if ('conveyor' in data.graphicData) {
      var conveyorData = data.graphicData.conveyor;
      var attr = conveyorData.data.substring(0, 2);
      var penColor = this.app.platform.penColorByAttribute(this.app.hexToInt(attr));
      var bkColor = this.app.platform.bkColorByAttribute(this.app.hexToInt(attr)&63);
      if (bkColor == this.app.platform.bkColorByAttribute(this.app.hexToInt(data.bkColor))) {
        bkColor = false;
      }
      for (var pos = 0; pos < this.app.hexToInt(conveyorData.length); pos++) {
        var conveyorEntity = new SpriteEntity(this, (conveyorData.location.x+pos)*8, (conveyorData.location.y)*8, penColor, bkColor, 0, 0);
        this.addEntity(conveyorEntity);
        conveyorEntity.setGraphicsDataFromHexStr('conveyor', conveyorData.data.substring(2, 18));
      }
    }
    
    // items
    var itemColor = 3;
    this.app.items[this.app.roomNumber].forEach((item) => {
      var penColor = this.app.platform.color(itemColor);
      var itemEntity = new SpriteEntity(this, item.x*8, item.y*8, penColor, false, 0, 0);
      this.addEntity(itemEntity);
      itemEntity.setGraphicsDataFromHexStr('item', data.graphicData.item);
      itemColor = this.app.rotateInc(itemColor, 3, 5);
    });
 
    // Willy
    var willy = data.willy;
    var penColor = this.app.platform.colorByName('white');
    if (data.initRoom == this.roomNumber) {
      var willyEntity = new SpriteEntity(this, willy.init.x+willy.paintCorrections.x, willy.init.y+willy.paintCorrections.y, penColor, false, willy.init.frame, willy.init.direction);
      this.addEntity(willyEntity);
      willyEntity.setGraphicsData(willy);
    }

    // guardians
    if ('guardians' in data) {
      ['horizontal', 'vertical'].forEach((guardianType) => {
        if (guardianType in data.guardians) {
          var guardianTypeData = data.guardians[guardianType];
          guardianTypeData.figures.forEach((guardian) => {
            var penColor = this.app.platform.penColorByAttribute(this.app.hexToInt(guardian.attribute));
            var guardianEntity = new SpriteEntity(this, guardian.init.x+guardianTypeData.paintCorrections.x, guardian.init.y+guardianTypeData.paintCorrections.y, penColor, false, guardian.init.frame, guardian.init.direction);
            this.addEntity(guardianEntity);
            guardianEntity.setGraphicsData(guardianTypeData);
          });
        }
      });
    }

    super.setData(data);
  } // setData
    

} // class RoomEntity

export default RoomEntity;
