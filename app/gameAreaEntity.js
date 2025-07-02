/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { DrawingCache } = await import('./svision/js/platform/canvas2D/drawingCache.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import DrawingCache from './svision/js/platform/canvas2D/drawingCache.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class GameAreaEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, roomNumber, initData) {
    super(parentEntity, x, y, width, height);
    this.id = 'GameAreaEntity';

    this.roomNumber = roomNumber;
    this.initData = initData;
    this.roomData = null;

    this.app.layout.newDrawingCache(this, 0); 
    this.graphicCache = {};
    this.staticKinds = ['floor', 'wall', 'nasty'];

    this.spriteEntities = {'conveyors': [], 'guardians': [], 'items': [], 'decorations': [], 'willy': []};
  } // constructor

  drawEntity() {
    if (this.roomData) {
      if (this.drawingCache[0].needToRefresh(this, this.width, this.height)) {
        this.app.layout.paintRect(this.drawingCache[0].ctx, 0, 0, this.width, this.height, this.app.platform.zxColorByAttr(this.app.hexToInt(this.roomData.bkColor), 56, 8));

        // layout
        this.roomData.layout.forEach((row, r) => {
          for (var column = 0; column < 32; column++) {
            var item = this.app.binToInt(this.app.hexToBin(row.substring(Math.floor(column/4)*2, Math.floor(column/4)*2+2)).substring(column%4*2, column%4*2+2));
            var idItem = [false, 'floor', 'wall', 'nasty'][item];
            if (idItem !== false) {
              var attr = this.roomData.graphicData[idItem].substring(0, 2);
              if (this.staticKinds.includes(idItem)) {
                if (this.graphicCache[idItem].needToRefresh(this, 8, 8)) {
                  var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(attr));
                  var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(attr)&63);
                  if (bkColor == this.app.platform.bkColorByAttr(this.app.hexToInt(this.roomData.bkColor))) {
                    bkColor = false;
                  }
                  if (bkColor != false) {
                    this.app.layout.paintRect(this.graphicCache[idItem].ctx, 0, 0, 8, 8, bkColor);
                  }
                  for (var y = 0; y < 8; y++) {
                    var spriteLine = this.app.hexToBin(this.roomData.graphicData[idItem].substring((y+1)*2, (y+1)*2+2));
                    for (var x = 0; x < 8; x++) {
                      if (spriteLine[x] == '1') {
                        this.app.layout.paintRect(this.graphicCache[idItem].ctx, x, y, 1, 1, penColor);
                      }
                    }
                  }
                }
              }
              this.drawingCache[0].ctx.drawImage(this.graphicCache[idItem].canvas, column*8*this.app.layout.ratio, r*8*this.app.layout.ratio);
            }
          }
        });

        // ramp
        if ('ramp' in this.roomData.graphicData) {
          var rampData = this.roomData.graphicData.ramp;
          var gradient = 1;
          if (rampData.gradient == 'left') {
              gradient = -1;
          }
          if (this.graphicCache['ramp'].needToRefresh(this, 8, 8)) {
            var attr = rampData.data.substring(0, 2);
            var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(attr));
            var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(attr)&63);
            if (bkColor == this.app.platform.bkColorByAttr(this.app.hexToInt(this.roomData.bkColor))) {
              bkColor = false;
            }
            if (bkColor != false) {
              this.app.layout.paintRect(this.graphicCache['ramp'].ctx, 0, 0, 8, 8, bkColor);
            }
            for (var y = 0; y < 8; y++) {
              var spriteLine = this.app.hexToBin(rampData.data.substring((y+1)*2, (y+1)*2+2));
              for (var x = 0; x < 8; x++) {
                if (spriteLine[x] == '1') {
                  this.app.layout.paintRect(this.graphicCache['ramp'].ctx, x, y, 1, 1, penColor);
                }
              }
            }
          }
          for (var pos = 0; pos < this.app.hexToInt(rampData.length); pos++) {
            this.drawingCache[0].ctx.drawImage(this.graphicCache['ramp'].canvas, (rampData.location.x+pos*gradient)*8*this.app.layout.ratio, (rampData.location.y-pos)*8*this.app.layout.ratio);
          }
        }
      }
      this.app.layout.paintCache(this, 0);
      super.drawSubEntities();
    }
  } // drawEntity

  setData(data) {
    this.roomData = data;

    // prepare drawing caches for layout
    this.drawingCache[0].cleanCache();
    this.graphicCache = {};
    Object.keys(data.graphicData).forEach((key) => {
      if (this.staticKinds.includes(key)) {
        this.graphicCache[key] = new DrawingCache(this.app);
      }
    });

    // ramp
    this.initData.ramps = [];
    if ('ramp' in data.graphicData) {
      this.graphicCache.ramp = new DrawingCache(this.app);
    }

    // conveyor
    this.initData.conveyors = [];
    if ('conveyor' in data.graphicData) {
      var conveyorData = data.graphicData.conveyor;
      var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(conveyorData.data.substring(0, 2)));
      var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(conveyorData.data.substring(0, 2)));
      if (bkColor == this.app.platform.bkColorByAttr(this.app.hexToInt(data.bkColor))) {
        bkColor = false;
      }
      var entity = new SpriteEntity(this, conveyorData.location.x*8, conveyorData.location.y*8, penColor, bkColor, 0, 0);
      entity.setFixSize(8, 8);
      entity.setRepeatX(this.app.hexToInt(conveyorData.length));
      entity.setGraphicsDataFromHexStr(conveyorData.data.substring(2, 18));
      entity.cloneSprite(0);
      var rotateDirection = 1;
      if (conveyorData.moving == 'right') {
        rotateDirection = -1;
      }
      entity.rotateSpriteRow(1, 0, -2*rotateDirection);
      entity.rotateSpriteRow(1, 2, 2*rotateDirection);
      entity.cloneSprite(1);
      entity.rotateSpriteRow(2, 0, -2*rotateDirection);
      entity.rotateSpriteRow(2, 2, 2*rotateDirection);
      entity.cloneSprite(2);
      entity.rotateSpriteRow(3, 0, -2*rotateDirection);
      entity.rotateSpriteRow(3, 2, 2*rotateDirection);
      this.addEntity(entity);
      this.spriteEntities.conveyors.push(entity);
      this.initData.conveyors.push({'visible': true, 'moving': conveyorData.moving, 'x': conveyorData.location.x*8, 'y': conveyorData.location.y*8, 'length': conveyorData.length*8, 'height': 8, 'frame': 0, 'direction': 0});
    }

    // items
    this.initData.items = [];
    var itemColor = 3;
    this.app.items[this.roomNumber].forEach((item) => {
      var tmpColor = itemColor;
      var penColor0 = this.app.platform.color(tmpColor);
      tmpColor = this.app.rotateInc(tmpColor, 3, 6);
      var penColor1 = this.app.platform.color(tmpColor);
      tmpColor = this.app.rotateInc(tmpColor, 3, 6);
      var penColor2 = this.app.platform.color(tmpColor);
      tmpColor = this.app.rotateInc(tmpColor, 3, 6);
      var penColor3 = this.app.platform.color(tmpColor);
      var entity = new SpriteEntity(this, item.x*8, item.y*8, false, false, 0, 0);
      this.addEntity(entity);
      entity.setColorsMap({'1': {0: penColor0, 1: penColor1, 2: penColor2, 3: penColor3}});
      entity.setGraphicsDataFromHexStr(data.graphicData.item);
      entity.cloneSprite(0);
      entity.cloneSprite(0);
      entity.cloneSprite(0);
      this.spriteEntities.items.push(entity);
      this.initData.items.push({'hide': false, 'x': item.x*8, 'y': item.y*8, 'frame': 0, 'direction': 0});
      itemColor = this.app.rotateInc(itemColor, 3, 6);
    });

    // guardians
    this.initData['guardians'] = [];
    if ('guardians' in data) {
      this.initData.guardians = [];
      ['horizontal', 'vertical'].forEach((guardianType) => {
        if (guardianType in data.guardians) {
          var guardianTypeData = data.guardians[guardianType];
          guardianTypeData.forEach((guardianDefs) => {
            guardianDefs.figures.forEach((guardian) => {
              var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(guardian.attribute));
              var entity = new SpriteEntity(this, guardian.init.x+guardianDefs.paintCorrections.x, guardian.init.y+guardianDefs.paintCorrections.y, penColor, false, guardian.init.frame, guardian.init.direction);
              entity.setGraphicsData(guardianDefs);
              this.addEntity(entity);
              this.spriteEntities.guardians.push(entity);
              switch (guardianType) {
                case 'horizontal':
                  this.initData.guardians.push({'type': guardianType, 'speed': guardian.speed, 'x': guardian.init.x, 'y': guardian.init.y, 'width': guardianDefs.width, 'height': guardianDefs.height, 'frame': guardian.init.frame, 'direction': guardian.init.direction, 'limitLeft': guardian.limits.left, 'limitRight': guardian.limits.right, 'paintCorrectionsX': guardianDefs.paintCorrections.x, 'paintCorrectionsY': guardianDefs.paintCorrections.y});
                  break;
                case 'vertical':
                  this.initData.guardians.push({'type': guardianType, 'speed': guardian.speed, 'x': guardian.init.x, 'y': guardian.init.y, 'width': guardianDefs.width, 'height': guardianDefs.height, 'frame': guardian.init.frame, 'frames': guardianDefs.frames, 'direction': guardian.init.direction, 'limitUp': guardian.limits.up, 'limitDown': guardian.limits.down, 'paintCorrectionsX': guardianDefs.paintCorrections.x, 'paintCorrectionsY': guardianDefs.paintCorrections.y});
                  break;
              }
            });
          });
        }
      });
    }

    // decorations
    this.initData.decorations = [];
    if ('decorations' in data) {
      data.decorations.forEach((decoration) => {
        var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(decoration.attribute));
        var entity = new SpriteEntity(this, decoration.x*8, decoration.y*8, penColor, false, 0, 0);
        this.addEntity(entity);
        entity.setGraphicsData(decoration);
        this.spriteEntities.decorations.push(entity);
        this.initData.decorations.push({'hide': false, 'kind': decoration.kind, 'x': decoration.x*8, 'y': decoration.y*8, 'frame': 0, 'direction': 0});
      });
    }

    // Willy
    this.initData.willy = [];
    var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(data.willy.attribute));
    var entity = new SpriteEntity(this, data.willy.init.x, data.willy.init.y, penColor, false, data.willy.init.frame, data.willy.init.direction);
    this.addEntity(entity);
    entity.setGraphicsData(data.willy);
    this.spriteEntities.willy.push(entity);
    this.initData.willy.push({'x': data.willy.init.x, 'y': data.willy.init.y, 'width': data.willy.width, 'height': data.willy.height, 'frame': data.willy.init.frame, 'direction': data.willy.init.direction, 'paintCorrectionsX': data.willy.paintCorrections.x, 'paintCorrectionsY': data.willy.paintCorrections.y});
  } // setData
    
} // class GameAreaEntity

export default GameAreaEntity;
