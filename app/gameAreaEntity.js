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
    this.app.layout.newDrawingCache(this, 1); 
    this.graphicCache = {};
    this.staticKinds = ['floor', 'wall', 'nasty'];

    this.spriteEntities = {'conveyors': [], 'rope': [], 'guardians': [], 'items': [], 'decorations': [], 'willy': []};
    this.ropeRelativeCoordinates = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,1,1,2,1,1,2,2,3,2,3,2,3,3,3,3,3,3],
      [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,3,3,2,3,2,3,2,3,2,2,2,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ];
  } // constructor

  drawEntity() {
    if (this.roomData) {
      var layoutObjects = [false, 'floor', 'wall', 'nasty'];

      for (var f = 0; f < 2; f++) {
        if (this.drawingCache[f].needToRefresh(this, this.width, this.height)) {
          this.app.layout.paintRect(this.drawingCache[f].ctx, 0, 0, this.width, this.height, this.app.platform.zxColorByAttr(this.app.hexToInt(this.roomData.bkColor), 56, 8));

          // layout
          this.roomData.layout.forEach((row, r) => {
            for (var column = 0; column < 32; column++) {
              var item = this.app.binToInt(this.app.hexToBin(row.substring(Math.floor(column/4)*2, Math.floor(column/4)*2+2)).substring(column%4*2, column%4*2+2));
              var idItem = layoutObjects[item];
              if (idItem !== false) {
                var attr = this.app.hexToInt(this.roomData.graphicData[idItem].substring(0, 2));
                if (this.staticKinds.includes(idItem)) {
                  if (this.graphicCache[idItem].needToRefresh(this, 8, 8)) {
                    var penColor = this.app.platform.penColorByAttr(attr);
                    var bkColor = this.app.platform.bkColorByAttr(attr);
                    if (f == 1) {
                      var tmpColor = penColor;
                      penColor = bkColor;
                      bkColor = tmpColor;
                    }
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
                this.drawingCache[f].ctx.drawImage(this.graphicCache[idItem].canvas, column*8*this.app.layout.ratio, r*8*this.app.layout.ratio);
              }
            }
          });
        }

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
            this.drawingCache[f].ctx.drawImage(this.graphicCache['ramp'].canvas, (rampData.location.x+pos*gradient)*8*this.app.layout.ratio, (rampData.location.y-pos)*8*this.app.layout.ratio);
          }
        }

        layoutObjects.forEach((idItem) => {
          if (idItem !== false && idItem in this.roomData.graphicData) {            
            var attr = this.app.hexToInt(this.roomData.graphicData[idItem].substring(0, 2));
            if ((attr&128) == 128) {
              this.graphicCache[idItem].cleanCache();
            }
          }
        });
      }

      switch (this.app.stack.flashState) {
        case false:
          this.app.layout.paintCache(this, 0);
          break;
        case true:
          this.app.layout.paintCache(this, 1);
          break;
      }

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
    // prepare drawing cache for ramp
    if ('ramp' in data.graphicData) {
      this.graphicCache.ramp = new DrawingCache(this.app);
    }

    // layout
    this.initData.floor = [];
    this.initData.wall = [];
    this.initData.nasty = [];
    data.layout.forEach((row, r) => {
      for (var column = 0; column < 32; column++) {
        var item = this.app.binToInt(this.app.hexToBin(row.substring(Math.floor(column/4)*2, Math.floor(column/4)*2+2)).substring(column%4*2, column%4*2+2));
        var idItem = [false, 'floor', 'wall', 'nasty'][item];
        if (idItem !== false) {
          var layoutInitData = {'x': column*8, 'y': r*8, 'width': 8, 'height': 8};
          switch (idItem) {
            case 'floor':
              this.initData.floor.push(layoutInitData);
              break;
            case 'wall':
              this.initData.wall.push(layoutInitData);
              break;
            case 'nasty':
              this.initData.nasty.push(layoutInitData);
              break;
          }
        }
      }
    });

    // ramp
    this.initData.ramps = [];
    if ('ramp' in data.graphicData) {
      var rampData = data.graphicData.ramp;
      var gradient = 1;
      if (rampData.gradient == 'left') {
          gradient = -1;
      }
      for (var pos = 0; pos < this.app.hexToInt(rampData.length)*8; pos++) {
        this.initData.ramps.push({
          'gradient': rampData.gradient,
          'x': rampData.location.x+pos*gradient,
          'y': rampData.location.y-pos,
          'width': 1,
          'height': 1,
          'frame': 0,
          'direction': 0
        });
      }
    }

    // conveyor
    this.initData.conveyors = [];
    if ('conveyor' in data.graphicData) {
      var conveyorData = data.graphicData.conveyor;
      var attr = this.app.hexToInt(conveyorData.data.substring(0, 2));
      var penColor = this.app.platform.penColorByAttr(attr);
      var bkColor = this.app.platform.bkColorByAttr(attr);
      if (bkColor == this.app.platform.bkColorByAttr(this.app.hexToInt(data.bkColor))) {
        bkColor = false;
      }
      var entity = new SpriteEntity(this, conveyorData.location.x*8, conveyorData.location.y*8, false, false, 0, 0);
      entity.setFixSize(8, 8);
      entity.setRepeatX(this.app.hexToInt(conveyorData.length));
      var colorsMap = {'1': {0: penColor, 1: penColor, 2: penColor, 3: penColor}};
      if (bkColor !== false) {
        colorsMap['0'] = {0: bkColor, 1: bkColor, 2: bkColor, 3: bkColor};
      }
      if ((attr & 128) == 128) {
        colorsMap['0'][4] = penColor;
        colorsMap['0'][5] = penColor;
        colorsMap['0'][6] = penColor;
        colorsMap['0'][7] = penColor;
        colorsMap['1'][4] = bkColor;
        colorsMap['1'][5] = bkColor;
        colorsMap['1'][6] = bkColor;
        colorsMap['1'][7] = bkColor;
      }
      entity.setColorsMap(colorsMap);
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
      var conveyorInitData = {
        'visible': true,
        'moving': conveyorData.moving,
        'x': conveyorData.location.x*8,
        'y': conveyorData.location.y*8,
        'length': conveyorData.length*8,
        'height': 8,
        'frame': 0,
        'direction': 0
      };
      if ((attr & 128) == 128) {
        entity.cloneSprite(0);
        entity.cloneSprite(1);
        entity.cloneSprite(2);
        entity.cloneSprite(3);
        conveyorInitData.flashShiftFrames = 4;
      }
      this.addEntity(entity);
      this.spriteEntities.conveyors.push(entity);
      this.initData.conveyors.push(conveyorInitData);
    }

    // rope
    this.initData.rope = []
    if ('rope' in data) {
      var color = this.app.platform.penColorByAttr(this.app.hexToInt(data.rope.attribute));
      var x = data.rope.init.x;
      var y = data.rope.init.y;
      var ptr = data.rope.init.frame;
      for (var r = 0; r <= data.rope.length; r++) {
        var entity = new AbstractEntity(this, x, y, 1, 1, false, color);
        this.addEntity(entity);
        this.spriteEntities.rope.push(entity);
        var ropeInitData = {
          'x': x,
          'y': y
        };
        if (r == 0) {
          ropeInitData.frame = data.rope.init.frame;
          ropeInitData.frames = data.rope.frames;       
          ropeInitData.direction = data.rope.init.direction;   
        }
        this.initData.rope.push(ropeInitData);
        x += this.ropeRelativeCoordinates[0][ptr];
        y += this.ropeRelativeCoordinates[1][ptr];
        ptr++;
      }
    }

    // guardians
    this.initData['guardians'] = [];
    if ('guardians' in data) {
      this.initData.guardians = [];
      ['horizontal', 'vertical', 'arrow', 'maria'].forEach((guardianType) => {
        if (guardianType in data.guardians) {
          var guardianTypeData = data.guardians[guardianType];
          guardianTypeData.forEach((guardianDefs) => {
            guardianDefs.figures.forEach((guardian) => {
              var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(guardian.attribute));
              var entity = new SpriteEntity(this, guardian.init.x+guardianDefs.paintCorrections.x, guardian.init.y+guardianDefs.paintCorrections.y, penColor, false, guardian.init.frame, guardian.init.direction);
              if ('hide' in guardian.init) {
                entity.hide = guardian.init.hide;
              }
              entity.setGraphicsData(guardianDefs);
              this.addEntity(entity);
              this.spriteEntities.guardians.push(entity);
              var guardianInitData = {
                'type': guardianType,
                'speed': guardian.speed,
                'x': guardian.init.x,
                'y': guardian.init.y,
                'width': guardianDefs.width,
                'height': guardianDefs.height,
                'paintCorrectionsX': guardianDefs.paintCorrections.x,
                'paintCorrectionsY': guardianDefs.paintCorrections.y,
                'frame': guardian.init.frame,
                'frames': guardianDefs.frames,
                'direction': guardian.init.direction
              };
              switch (guardianType) {
                case 'horizontal':
                  guardianInitData.limitLeft = guardian.limits.left;
                  guardianInitData.limitRight = guardian.limits.right;
                  break;
                case 'vertical':
                  guardianInitData.limitUp = guardian.limits.up;
                  guardianInitData.limitDown = guardian.limits.down;
                  break;
                case 'arrow':
                  guardianInitData.hide = guardian.init.hide;
                  guardianInitData.counter = guardian.init.counter;
                  guardianInitData.minCounter = guardian.minCounter;
                  guardianInitData.maxCounter = guardian.maxCounter;
                  guardianInitData.soundWhenCounter = guardian.soundWhenCounter;
                  break;
                case 'maria':
                  guardianInitData.hide = guardian.init.hide;
                  break;
              }
              this.initData.guardians.push(guardianInitData);
            });
          });
        }
      });
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
      if (!('matchColorsOfItems' in data) && (!data.matchColorsOfItems)) {
        itemColor = this.app.rotateInc(itemColor, 3, 6);
      }
    });


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
    this.initData.willy.push({
      'x': data.willy.init.x,
      'y': data.willy.init.y,
      'width': data.willy.width,
      'height': data.willy.height,
      'paintCorrectionsX': data.willy.paintCorrections.x,
      'paintCorrectionsY': data.willy.paintCorrections.y,
      'frame': data.willy.init.frame,
      'frames': data.willy.init.frames,
      'direction': data.willy.init.direction
    });
  } // setData
    
  updateData(data, objectsType) {
    data.gameData[objectsType].forEach((object, o) => {
      var x = object.x;
      if ('paintCorrectionsX' in object) {
        x += object.paintCorrectionsX;
      }
      this.spriteEntities[objectsType][o].x = x;
      var y = object.y;
      if ('paintCorrectionsY' in object) {
        y += object.paintCorrectionsY;
      }
      this.spriteEntities[objectsType][o].y = y;
      var flashShiftFrames = 0;
      if (('flashShiftFrames' in object) && this.app.stack.flashState) {
        flashShiftFrames = object.flashShiftFrames;
      }
      this.spriteEntities[objectsType][o].frame = object.frame+flashShiftFrames;
      this.spriteEntities[objectsType][o].direction = object.direction;
      if ('width' in object) {
        var width = object.width;
        if ('paintCorrectionsX' in object) {
          width -= object.paintCorrectionsX;
        }
        this.spriteEntities[objectsType][o].width = width;
      }
      if ('height' in object) {
        var height = object.height;
        if ('paintCorrectionsY' in object) {
          height -= object.paintCorrectionsY;
        }
        this.spriteEntities[objectsType][o].height = height;
      }
      if ('hide' in object) {
        this.spriteEntities[objectsType][o].hide = object.hide;
      }
    });
  } // updateData

} // class GameAreaEntity

export default GameAreaEntity;
