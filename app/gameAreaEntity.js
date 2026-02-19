/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { DrawingCache } = await import('./svision/js/platform/canvas2D/drawingCache.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
const { RopeEntity } = await import('./ropeEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import DrawingCache from './svision/js/platform/canvas2D/drawingCache.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
import RopeEntity from './ropeEntity.js';
/**/
// begin code

export class GameAreaEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height, roomNumber, initData, demo) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'GameAreaEntity';

    this.roomNumber = roomNumber;
    this.initData = initData;
    this.demo = demo;
    this.roomData = null;
    this.layoutExtends = {ramps:[]};
    this.staticKinds = ['floor', 'wall', 'nasty'];
    this.layoutObjects = [false, 'floor', 'wall', 'nasty'];

    this.bkColorForRestore = false;
    this.monochromeColor = false;

    this.app.layout.newDrawingCache(this, 0); 
    this.app.layout.newDrawingCache(this, 1); 
    this.app.layout.newDrawingCache(this, 2); 
    this.app.layout.newDrawingCache(this, 3); 
    this.graphicCache = {};

    this.spriteEntities = {conveyors: [], ropes: [], guardians: [], items: [], switches: [], willy: [], ramps: []};
  } // constructor

  drawEntity() {
    if (this.roomData) {
      var graphicData = this.roomData.graphicData;
      var roomBkColor = this.app.platform.zxColorByAttr(this.app.hexToInt(this.roomData.bkColor), 56, 8);

      this.app.layout.paint(this, 0, 0, this.width, this.height, this.bkColor);

      for (var f = 0; f < 2; f++) {
        if (this.drawingCache[f].needToRefresh(this, this.width, this.height)) {
          // layout - bkColor
          this.roomData.layout.forEach((row, r) => {
            for (var column = 0; column < 32; column++) {
              var item = this.app.binToInt(this.app.hexToBin(row.substring(Math.floor(column/4)*2, Math.floor(column/4)*2+2)).substring(column%4*2, column%4*2+2));
              var idItem = this.layoutObjects[item];
              if (idItem !== false) {
                var attr = this.app.hexToInt(graphicData[idItem].substring(0, 2));
                if (this.staticKinds.includes(idItem)) {
                  var penColor = this.penColorByAttr(attr);
                  var bkColor = this.bkColorByAttr(attr);
                  if (bkColor == roomBkColor) {
                    bkColor = false;
                  }
                  if (f == 1 && (attr&128) == 128) {
                    bkColor = penColor;
                  }
                  if (bkColor != false) {
                    this.app.layout.paintRect(this.drawingCache[f].ctx, column*8, r*8, 8, 8, bkColor);
                  }
                }
              }
            }
          });

          // walls & floors & nasties - bkColor
          ['walls', 'floors', 'nasties'].forEach((objectType) => {
            if (objectType in graphicData) {
              graphicData[objectType].forEach((objData) => {
                var attr = this.app.hexToInt(objData.data.substring(0, 2));
                var penColor = this.penColorByAttr(attr);
                var bkColor = this.bkColorByAttr(attr);
                if (bkColor == roomBkColor) {
                  bkColor = false;
                }
                if (f == 1 && (attr&128) == 128) {
                  bkColor = penColor;
                }
                var locations = false;
                if ('locations' in objData) {
                  locations = objData.locations;
                } else {
                  locations = [objData.location];
                }
                locations.forEach((location) => {
                  for (var w = 0; w < objData.width; w++) {
                    for (var h = 0; h < objData.height; h++) {
                      if (bkColor != false) {
                        this.app.layout.paintRect(this.drawingCache[f].ctx, (location.x+w)*8, (location.y+h)*8, 8, 8, bkColor);
                      }
                    }
                  }
                });
              });
            }
          });
        }
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

      for (var f = 2; f < 4; f++) {
        if (this.drawingCache[f].needToRefresh(this, this.width, this.height)) {
          // layout - penColor
          this.roomData.layout.forEach((row, r) => {
            for (var column = 0; column < 32; column++) {
              var item = this.app.binToInt(this.app.hexToBin(row.substring(Math.floor(column/4)*2, Math.floor(column/4)*2+2)).substring(column%4*2, column%4*2+2));
              var idItem = this.layoutObjects[item];
              if (idItem !== false) {
                var itemData = graphicData[idItem];
                var attr = itemData.substring(0, 2);
                if (this.staticKinds.includes(idItem)) {
                  if (this.graphicCache[itemData].needToRefresh(this, 8, 8)) {
                    var penColor = this.penColorByAttr(this.app.hexToInt(attr));
                    var bkColor = this.bkColorByAttr(this.app.hexToInt(attr));
                    if (bkColor == roomBkColor) {
                      bkColor = false;
                    }
                    if (f == 3) {
                      penColor = bkColor;
                    }
                    for (var y = 0; y < 8; y++) {
                      var spriteLine = this.app.hexToBin(itemData.substring((y+1)*2, (y+1)*2+2));
                      for (var x = 0; x < 8; x++) {
                        if (spriteLine[x] == '1') {
                          this.app.layout.paintRect(this.graphicCache[itemData].ctx, x, y, 1, 1, penColor);
                        }
                      }
                    }
                  }
                }
                this.drawingCache[f].ctx.drawImage(this.graphicCache[itemData].canvas, column*8*this.app.layout.ratio, r*8*this.app.layout.ratio);
              }
            }
          });
        }

        // walls & floors & nasties - penColor
        ['walls', 'floors', 'nasties'].forEach((objectType) => {
          if (objectType in graphicData) {
            graphicData[objectType].forEach((objData) => {
              if (this.graphicCache[objData.data].needToRefresh(this, 8, 8)) {
                var attr = objData.data.substring(0, 2);
                var penColor = this.penColorByAttr(this.app.hexToInt(attr));
                var bkColor = this.bkColorByAttr(this.app.hexToInt(attr));
                if (bkColor == roomBkColor) {
                  bkColor = false;
                }
                if (f == 3) {
                  penColor = bkColor;
                }
                for (var y = 0; y < 8; y++) {
                  var spriteLine = this.app.hexToBin(objData.data.substring((y+1)*2, (y+1)*2+2));
                  for (var x = 0; x < 8; x++) {
                    if (spriteLine[x] == '1') {
                      this.app.layout.paintRect(this.graphicCache[objData.data].ctx, x, y, 1, 1, penColor);
                    }
                  }
                }
              }
              var locations = false;
              if ('locations' in objData) {
                locations = objData.locations;
              } else {
                locations = [objData.location];
              }
              locations.forEach((location) => {
                for (var w = 0; w < objData.width; w++) {
                  for (var h = 0; h < objData.height; h++) {
                    this.drawingCache[f].ctx.drawImage(this.graphicCache[objData.data].canvas, (location.x+w)*8*this.app.layout.ratio, (location.y+h)*8*this.app.layout.ratio);
                  }
                }
              });
            });
          }
        });

        // ramps
        this.layoutExtends.ramps.forEach((rampData) => {
          var gradient = 1;
          if (rampData.gradient == 'left') {
              gradient = -1;
          }
          if (this.graphicCache[rampData.data].needToRefresh(this, 8, 8)) {
            var attr = rampData.data.substring(0, 2);
            var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(attr));
            if (this.monochromeColor !== false) {
              penColor = this.monochromeColor;
            }
            var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(attr)&63);
            if (bkColor == roomBkColor) {
              bkColor = false;
            }
            if (bkColor != false) {
              this.app.layout.paintRect(this.graphicCache[rampData.data].ctx, 0, 0, 8, 8, bkColor);
            }
            for (var y = 0; y < 8; y++) {
              var spriteLine = this.app.hexToBin(rampData.data.substring((y+1)*2, (y+1)*2+2));
              for (var x = 0; x < 8; x++) {
                if (spriteLine[x] == '1') {
                  this.app.layout.paintRect(this.graphicCache[rampData.data].ctx, x, y, 1, 1, penColor);
                }
              }
            }
          }
          var locations = false;
          if ('locations' in rampData) {
            locations = rampData.locations;
          } else {
            locations = [rampData.location];
          }
          locations.forEach((location) => {
            for (var pos = 0; pos < rampData.length; pos++) {
              this.drawingCache[f].ctx.drawImage(this.graphicCache[rampData.data].canvas, (location.x+pos*gradient)*8*this.app.layout.ratio, (location.y-pos)*8*this.app.layout.ratio);
            }
          });
        });

        this.layoutObjects.forEach((idItem) => {
          if (idItem !== false && idItem in graphicData) {            
            var attr = this.app.hexToInt(graphicData[idItem].substring(0, 2));
            if ((attr&128) == 128) {
              this.graphicCache[graphicData[idItem]].cleanCache();
            }
          }
        });
      }

      switch (this.app.stack.flashState) {
        case false:
          this.app.layout.paintCache(this, 2);
          break;
        case true:
          this.app.layout.paintCache(this, 3);
          break;
      }
    }

    // draw attribute efects on Willy due bkColor on conveyors
    if (!this.demo) {
      var c = 0;
      while (c < this.spriteEntities.conveyors.length && !this.spriteEntities.conveyors[c].hide) {
        var conveyor = this.spriteEntities.conveyors[c];
        if (conveyor.bkColor !== false) {
          var obj = this.spriteEntities.willy[0];
          if (!(obj.x+obj.width <= conveyor.x || obj.y+obj.height <= conveyor.y || obj.x >= conveyor.x+conveyor.width || obj.y >= conveyor.y+conveyor.height)) {
            var x = Math.max(obj.x, conveyor.x);
            var y = Math.max(obj.y, conveyor.y);
            var w = Math.min(obj.x+obj.width, conveyor.x+conveyor.width)-x;
            var h = Math.min(obj.y+obj.height, conveyor.y+conveyor.height)-y;
            var d = obj.direction;
            if (obj.directions == 1) {
              d = 0;
            }
            obj.spriteData[obj.frame+d*obj.frames].forEach((pixel) => {
              if (pixel.x >= x-obj.x && pixel.y >= y-obj.y && pixel.x < x-obj.x+w && pixel.y < y-obj.y+h) {
                this.app.layout.paintRect(this.app.stack.ctx, obj.parentX+obj.x+pixel.x, obj.parentY+obj.y+pixel.y, 1, 1, conveyor.penColor);
              }
            });
          }
        }
        c++;
      }
    }
  } // drawEntity

  setData(data) {
    this.roomData = data;

    var graphicData = data.graphicData;
    if ('ramps' in graphicData) {
      this.layoutExtends.ramps = [...graphicData.ramps];
    }

    if ('extends' in graphicData) {
      data.layout.forEach((row, r) => {
        for (var column = 0; column < 32; column++) {
          var item = this.app.binToInt(this.app.hexToBin(row.substring(Math.floor(column/4)*2, Math.floor(column/4)*2+2)).substring(column%4*2, column%4*2+2));
          var idItem = this.layoutObjects[item];
          if (idItem !== false) {
            if (this.staticKinds.includes(idItem)) {
              Object.keys(graphicData.extends).forEach((key) => {
                if (key == idItem) {
                  var objData = {
                    data: graphicData[idItem],
                    location: {
                      x: column,
                      y: r
                    },
                    length: 1
                  };
                  switch (graphicData.extends[key].objects) {
                    case 'ramps':
                      objData.gradient = graphicData.extends[key].gradient;
                      break;
                  }
                  this.layoutExtends[graphicData.extends[key].objects].push(objData);
                }
              });
            }
          }
        }
      });
    }

    this.bkColor = this.app.platform.zxColorByAttr(this.app.hexToInt(data.bkColor), 56, 8);
    this.bkColorForRestore = this.bkColor;

    // Willy
    this.initData.willy = [];
    if (!this.demo) {
      var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(data.willy.attribute));
      var entity = new SpriteEntity(this, this.app.willyRoomsCache.x+data.willy.paintCorrections.x, this.app.willyRoomsCache.y, penColor, false, this.app.willyRoomsCache.frame, this.app.willyRoomsCache.direction);
      this.addEntity(entity);
      entity.setGraphicsData(data.willy);
      this.spriteEntities.willy.push(entity);
      this.initData.willy.push(this.app.willyRoomsCache);
    }

    // prepare drawing caches for layout
    this.drawingCache[0].cleanCache();
    this.drawingCache[1].cleanCache();
    this.drawingCache[2].cleanCache();
    this.drawingCache[3].cleanCache();
    this.graphicCache = {};
    Object.keys(graphicData).forEach((key) => {
      if (this.staticKinds.includes(key)) {
        if (!(graphicData[key] in this.graphicCache)) {
          this.graphicCache[graphicData[key]] = new DrawingCache(this.app);
        }
      }
    });
    ['ramps', 'walls', 'floors', 'nasties'].forEach((objectType) => {
      if (objectType in graphicData) {
        graphicData[objectType].forEach((objData) => {
          if (!(objData.data in this.graphicCache)) {
            this.graphicCache[objData.data] = new DrawingCache(this.app);
          }
        });
      }
    });

    // layout
    this.initData.floors = [];
    this.initData.walls = [];
    this.initData.nasties = [];
    data.layout.forEach((row, r) => {
      for (var column = 0; column < 32; column++) {
        var item = this.app.binToInt(this.app.hexToBin(row.substring(Math.floor(column/4)*2, Math.floor(column/4)*2+2)).substring(column%4*2, column%4*2+2));
        var idItem = [false, 'floor', 'wall', 'nasty'][item];
        if (idItem !== false) {
          var layoutInitData = {x: column*8, y: r*8, width: 8, height: 8};
          switch (idItem) {
            case 'floor':
              this.initData.floors.push(layoutInitData);
              break;
            case 'wall':
              this.initData.walls.push(layoutInitData);
              break;
            case 'nasty':
              this.initData.nasties.push(layoutInitData);
              break;
          }
        }
      }
    });

    // walls & floors & nasties
    ['walls', 'floors', 'nasties'].forEach((objectType) => {
      if (objectType in graphicData) {
        graphicData[objectType].forEach((objData) => {
          var locations = false;
          if ('locations' in objData) {
            locations = objData.locations;
          } else {
            locations = [objData.location];
          }
          locations.forEach((location) => {
            for (var w = 0; w < objData.width; w++) {
              for (var h = 0; h < objData.height; h++) {
                var objInitData = {x: (location.x+w)*8, y: (location.y+h)*8, width: 8, height: 8};
                if ('moving' in objData) {
                  objInitData.moving = objData.moving;
                }
                this.initData[objectType].push(objInitData);
              }
            }
          });
        });
      }
    });

    // ramps
    this.initData.ramps = [];
    this.layoutExtends.ramps.forEach((rampData) => {
      var rampLength = rampData.length;
      var locations = false;
      if ('locations' in rampData) {
        locations = rampData.locations;
      } else {
        locations = [rampData.location];
      }
      locations.forEach((location) => {
        var rampInitData = {
          gradient: rampData.gradient,
          width: rampLength*8,
          height: rampLength*8,
          frame: 0,
          direction: 0
        };
        switch (rampData.gradient) {
          case 'right':
            rampInitData.x = location.x*8;
            rampInitData.y = (location.y-rampLength+1)*8;
            break;
          case 'left':
            rampInitData.x = (location.x-rampLength+1)*8;
            rampInitData.y = (location.y-rampLength+1)*8;
            break;
        }
        if ('moving' in rampData) {
          rampInitData.moving = rampData.moving;
        }
        this.initData.ramps.push(rampInitData);
      });
    });

    // conveyors
    this.initData.conveyors = [];
    if ('conveyors' in graphicData) {
      graphicData.conveyors.forEach((conveyorData) => {
        var attr = this.app.hexToInt(conveyorData.data.substring(0, 2));
        var penColor = this.app.platform.penColorByAttr(attr);
        var bkColor = this.app.platform.bkColorByAttr(attr);
        if (bkColor == this.bkColor) {
          bkColor = false;
        }
        var entity = new SpriteEntity(this, conveyorData.location.x*8, conveyorData.location.y*8, penColor, bkColor, 0, 0);
        entity.setFixSize(8, 8);
        entity.setRepeatX(this.app.hexToInt(conveyorData.length));
        var conveyorSpriteData = conveyorData.data.substring(2, 18);
        entity.setGraphicsDataFromHexStr(conveyorSpriteData);
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
          x: conveyorData.location.x*8,
          y: conveyorData.location.y*8,
          width: conveyorData.length*8,
          height: 8,
          frame: 0,
          direction: 0,
          moving: conveyorData.moving
        };
        if ((attr & 128) == 128) {
          var reverseSpriteData = '';
          for (var s = 0; s < 8; s++) {
            var hexStr = this.app.intToHex((this.app.hexToInt(conveyorSpriteData.substring(s*2, s*2+2))^255));
            hexStr.padStart(2, '0');
            reverseSpriteData = reverseSpriteData+hexStr;
          }
          entity.addGraphicsDataFromHexStr(reverseSpriteData);
          entity.cloneSprite(4);
          entity.rotateSpriteRow(5, 0, -2*rotateDirection);
          entity.rotateSpriteRow(5, 2, 2*rotateDirection);
          entity.cloneSprite(5);
          entity.rotateSpriteRow(6, 0, -2*rotateDirection);
          entity.rotateSpriteRow(6, 2, 2*rotateDirection);
          entity.cloneSprite(6);
          entity.rotateSpriteRow(7, 0, -2*rotateDirection);
          entity.rotateSpriteRow(7, 2, 2*rotateDirection);
          conveyorInitData.flashShiftFrames = 4;
        }
        this.addEntity(entity);
        this.spriteEntities.conveyors.push(entity);
        this.initData.conveyors.push(conveyorInitData);
      });
    }

    // ropes
    this.initData.ropes = []
    if ('ropes' in data) {
      data.ropes.forEach((ropeData, rope) => {
        this.spriteEntities.ropes.push({nodes:[]});
        var color = this.app.platform.penColorByAttr(this.app.hexToInt(ropeData.attribute));
        var x = ropeData.init.x;
        var y = ropeData.init.y;
        var ptr = Math.abs(ropeData.init.frame);
        var ropeInitData = {
          length: ropeData.length,
          frame: ropeData.init.frame,
          direction: ropeData.init.direction,
          prevDirection: ropeData.init.direction,
          frames: ropeData.frames,
          climbBlock: ropeData.climbBlock,
          relativeCoordinates: ropeData.relativeCoordinates,
          nodes: []
        };

        for (var r = 0; r <= ropeData.length; r++) {
          var entity = new RopeEntity(this, x, y, 1, 1, color);
          this.addEntity(entity);
          this.spriteEntities.ropes[rope].nodes.push(entity);
          ropeInitData.nodes.push({x: x, y: y});
          x += ropeData.relativeCoordinates[0][ptr]*Math.sign(ropeData.init.frame);
          y += ropeData.relativeCoordinates[1][ptr];
          ptr++;
        }
        this.initData.ropes.push(ropeInitData);
      });
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
              if (!('forGameState' in guardianDefs) || guardianDefs.forGameState == this.app.gameState) {
                var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(guardian.attribute));
                var paintCorrectionsX = 0;
                var paintCorrectionsY = 0;
                if ('paintCorrections' in guardianDefs) {
                  paintCorrectionsX = guardianDefs.paintCorrections.x;
                  paintCorrectionsY = guardianDefs.paintCorrections.y;
                }
                var entity = new SpriteEntity(this, guardian.init.x+paintCorrectionsX, guardian.init.y+paintCorrectionsY, penColor, false, guardian.init.frame, guardian.init.direction);
                if ('hide' in guardian.init) {
                  entity.hide = guardian.init.hide;
                }
                entity.setGraphicsData(guardianDefs);
                this.addEntity(entity);
                this.spriteEntities.guardians.push(entity);
                var guardianInitData = {
                  type: guardianType,
                  speed: guardian.speed,
                  x: guardian.init.x,
                  y: guardian.init.y,
                  width: guardianDefs.width,
                  height: guardianDefs.height,
                  frame: guardian.init.frame,
                  frames: guardianDefs.frames,
                  direction: guardian.init.direction,
                  directions: guardianDefs.directions
                };
                if ('paintCorrections' in guardianDefs) {
                  guardianInitData.paintCorrections = guardianDefs.paintCorrections;
                }
                if ('touchCorrections' in guardianDefs) {
                  guardianInitData.touchCorrections = guardianDefs.touchCorrections;
                }
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
              }
            });
          });
        }
      });
    }

    // items
    this.initData.items = [];
    var itemColor = 3;
    this.app.items[this.roomNumber].forEach((item) => {
      if (!(item.id in this.app.itemsCollected)) {
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
        entity.setColorsMap({1: {0: penColor0, 1: penColor1, 2: penColor2, 3: penColor3}});
        entity.setGraphicsDataFromHexStr(graphicData.item);
        entity.cloneSprite(0);
        entity.cloneSprite(0);
        entity.cloneSprite(0);
        this.spriteEntities.items.push(entity);
        this.initData.items.push({id: item.id, hide: false, x: item.x*8, y: item.y*8, width: 8, height: 8, frame: 0, direction: 0});
        if (!('matchColorsOfItems' in data) && (!data.matchColorsOfItems)) {
          itemColor = this.app.rotateInc(itemColor, 3, 6);
        }
      }
    });


    // switches
    this.initData.switches = [];
    if ('switches' in data) {
      data.switches.forEach((switche) => {
        var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(switche.attribute));
        var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(switche.attribute));
        if (bkColor == this.bkColor) {
          bkColor = false;
        }
        var entity = new SpriteEntity(this, switche.x*8, switche.y*8, penColor, bkColor, 0, 0);
        this.addEntity(entity);
        entity.setGraphicsData(switche);
        this.spriteEntities.switches.push(entity);
        this.initData.switches.push({
          hide: false,
          x: switche.x*8, y: switche.y*8,
          width: switche.width, height: switche.height,
          frame: switche.frame, direction: switche.direction,
          frames: switche.frames, directions: switche.directions,
          actions: switche.actions
        });
      });
    }

    // optimization when Willy is below on the ramp
    if (!this.demo) {
      if (this.isStandingAtBottomOfRamp()) {
        this.app.willyRoomsCache.y = 110;
        this.spriteEntities.willy[0].y = 110;
        this.initData.willy[0].y = 110;
      }
    }
  } // setData

  isStandingAtBottomOfRamp() {
    var willy = this.initData.willy[0];
    var objectsArray = [this.initData.walls, this.initData.floors, this.initData.conveyors];

    if (willy.y != 104) {
      return false;
    }

    if (willy.jumpCounter) {
      return false;
    }

    for (var a = 0; a < objectsArray.length; a++) {
      var objects = objectsArray[a];
      for (var o = 0; o < objects.length; o++) {
        var obj = objects[o];
        if (!('hide' in obj) || !obj.hide) {
          if (!(willy.x+10 <= obj.x || willy.x >= obj.x+obj.width) && willy.y+16 == obj.y) {
            return false;
          }
        }
      }
    }

    for (var o = 0; o < this.initData.ramps.length; o++) {
      var obj = this.initData.ramps[o];
      switch (obj.gradient) {
        case 'right':
          if (willy.y+willy.height >= obj.y && willy.y+willy.height < obj.y+obj.height) {
            if (willy.y+6+16 == obj.y+obj.height-willy.x-10+obj.x) {
              return true;
            }
          }
          break;
        case 'left':
          if (willy.y+willy.height >= obj.y && willy.y+willy.height < obj.y+obj.height) {
            if (willy.y+6+16 == obj.y+obj.height+willy.x-obj.x-obj.width) {
              return true;
            }
          }
          break;
      }
    }

    return false;
  } // isStandingAtBottomOfRamp
      
  updateData(gameData, objectsType, subType) {
    gameData[objectsType].forEach((object, o) => {
      var spriteEntity = false;
      var subObjects = false;
      if (subType === false) {
        subObjects = [object];
        spriteEntity = this.spriteEntities[objectsType][o];
      } else {
        subObjects = object[subType];
      }
      subObjects.forEach((subObj, s) => {
        if (subType !== false) {
          spriteEntity = this.spriteEntities[objectsType][o][subType][s];
        }
        var paintCorrectionX = 0;
        var paintCorrectionY = 0;
        if ('paintCorrections' in subObj) {
          paintCorrectionX = subObj.paintCorrections.x;
          paintCorrectionY = subObj.paintCorrections.y;
        }
        spriteEntity.x = subObj.x+paintCorrectionX;
        spriteEntity.y = subObj.y+paintCorrectionY;
        var flashShiftFrames = 0;
        if (('flashShiftFrames' in subObj) && this.app.stack.flashState) {
          flashShiftFrames = subObj.flashShiftFrames;
        }
        spriteEntity.frame = subObj.frame+flashShiftFrames;
        spriteEntity.direction = subObj.direction;
        if ('width' in subObj) {
          spriteEntity.width = subObj.width-paintCorrectionX;
        }
        if ('height' in subObj) {
          spriteEntity.height = subObj.height-paintCorrectionY;
        }
        if ('hide' in subObj) {
          spriteEntity.hide = subObj.hide;
        }
      });
    });
  } // updateData


  cleanCache() {
    this.drawingCache[0].cleanCache();
    this.drawingCache[1].cleanCache();
    this.drawingCache[2].cleanCache();
    this.drawingCache[3].cleanCache();
    Object.keys(this.graphicCache).forEach((attr) => {
      this.graphicCache[attr].cleanCache();
    });
  } // cleanCache

  penColorByAttr(attr) {
    if (this.monochromeColor) {
      return this.monochromeColor;
    }
    return this.app.platform.penColorByAttr(attr);
  } // penColorByAttr

  bkColorByAttr(attr) {
    if (this.monochromeColor) {
      return false;
    }
    return this.app.platform.bkColorByAttr(attr);
  } // bkColorByAttr

  restoreBkColor() {
    if (this.restoreBkColor !== false) {
      this.bkColor = this.bkColorForRestore;
    }
  } // restoreBkColor

  setMonochromeColors(monochromeColor, bkColor) {
    this.monochromeColor = monochromeColor;
    this.setBkColor(bkColor);

    Object.keys(this.spriteEntities).forEach((objectsType) => {
      switch (objectsType) {
        case 'ropes':
            this.spriteEntities.ropes.forEach((rope) => {
              rope.nodes.forEach((node) => {
                node.bkColor = false;
                node.setPenColor(monochromeColor);
              });
            });
          break;

        default:
          this.spriteEntities[objectsType].forEach((object) => {
            object.bkColor = false;
            object.setPenColor(monochromeColor);
          });
      }
    });
  } // setMonochromeColors

} // GameAreaEntity

export default GameAreaEntity;
