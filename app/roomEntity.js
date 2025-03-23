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
    this.bkColor = this.app.platform.zxColorByAttribut(this.app.hexToInt(data['bkColor']), 56, 8);


    // layout
    data['layout'].forEach((row, y) => {
      for (var x = 0; x < 32; x++) {
        var item = this.app.binToInt(this.app.hexToBin(row.substring(Math.floor(x/4)*2, Math.floor(x/4)*2+2)).substring(x%4*2, x%4*2+2));
        var idItem = [false, 'floor', 'wall', 'nasty'][item];
        if (idItem !== false) {
          var attr = data['graphicData'][idItem].substring(0, 2);
          //if (['floor', 'wall'].includes(idItem)) {
          {
            var spriteData = [];
            var graphicData = data['graphicData'][idItem].substring(2, 18);
            for (var b = 0; b < 8; b++) {
              var line = this.app.hexToBin(graphicData.substring(b*2, b*2+2));
              for (var col = 0; col < line.length; col++) {
                if (line[col] == '1') {
                  spriteData.push({'x': col, 'y': b});
                }
              }
            }
            var penColor = this.app.platform.penColorByAttribut(this.app.hexToInt(attr));
            var bkColor = this.app.platform.bkColorByAttribut(this.app.hexToInt(attr)&63);
            if (bkColor == this.app.platform.bkColorByAttribut(this.app.hexToInt(data['bkColor']))) {
              bkColor = false;
            }
            this.addEntity(new SpriteEntity(this, x*8, y*8, 8, 8, spriteData, penColor, bkColor));
          }
        }
      }
    });

    // ramp
    if ('ramp' in data['graphicData']) {
      var spriteData = [];
      var conveyorData = data['graphicData']['ramp'];
      var attr = conveyorData['data'].substring(0, 2);
      var graphicData = conveyorData['data'].substring(2, 18);
      for (var b = 0; b < 8; b++) {
        var line = this.app.hexToBin(graphicData.substring(b*2, b*2+2));
        for (var col = 0; col < line.length; col++) {
          if (line[col] == '1') {
            spriteData.push({'x': col, 'y': b});
          }
        }
      }
      var penColor = this.app.platform.penColorByAttribut(this.app.hexToInt(attr));
      var bkColor = this.app.platform.bkColorByAttribut(this.app.hexToInt(attr)&63);
      if (bkColor == this.app.platform.bkColorByAttribut(this.app.hexToInt(data['bkColor']))) {
        bkColor = false;
      }
      var direction = 0;
      switch (conveyorData['direction']) {
        case 'left':
          direction = -1;
          break;
        case 'right':
          direction = 1;
          break;
        }
      for (var pos = 0; pos < this.app.hexToInt(conveyorData['length']); pos++) {
        this.addEntity(new SpriteEntity(this, (conveyorData['location']['x']+pos*direction)*8, (conveyorData['location']['y']-pos)*8, 8, 8, spriteData, penColor, bkColor));
      }
    }

    // conveyor
    if ('conveyor' in data['graphicData']) {
      var spriteData = [];
      var conveyorData = data['graphicData']['conveyor'];
      var attr = conveyorData['data'].substring(0, 2);
      var graphicData = conveyorData['data'].substring(2, 18);
      for (var b = 0; b < 8; b++) {
        var line = this.app.hexToBin(graphicData.substring(b*2, b*2+2));
        for (var col = 0; col < line.length; col++) {
          if (line[col] == '1') {
            spriteData.push({'x': col, 'y': b});
          }
        }
      }
      var penColor = this.app.platform.penColorByAttribut(this.app.hexToInt(attr));
      var bkColor = this.app.platform.bkColorByAttribut(this.app.hexToInt(attr)&63);
      if (bkColor == this.app.platform.bkColorByAttribut(this.app.hexToInt(data['bkColor']))) {
        bkColor = false;
      }
      for (var pos = 0; pos < this.app.hexToInt(conveyorData['length']); pos++) {
        this.addEntity(new SpriteEntity(this, (conveyorData['location']['x']+pos)*8, conveyorData['location']['y']*8, 8, 8, spriteData, penColor, bkColor));
      }
    }
    
    // items
    this.app.items[this.app.roomNumber].forEach((item) => {
      var spriteData = [];
      var graphicData = data['graphicData']['item'];
      for (var b = 0; b < 8; b++) {
        var line = this.app.hexToBin(graphicData.substring(b*2, b*2+2));
        for (var col = 0; col < line.length; col++) {
          if (line[col] == '1') {
            spriteData.push({'x': col, 'y': b});
          }
        }
      }
      var penColor = this.app.platform.colorByName('white');
      this.addEntity(new SpriteEntity(this, item['x']*8, item['y']*8, 8, 8, spriteData, penColor, false));
    });

    super.setData(data);
  } // setData
    

} // class RoomEntity

export default RoomEntity;
