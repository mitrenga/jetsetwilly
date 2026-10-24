const { RasterEntity } = await import('./svision/js/platform/canvas2D/rasterEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
const { SpriteTool } = await import('./svision/js/spriteTool.js?ver='+window.srcVersion);
const { RopeEntity } = await import('./ropeEntity.js?ver='+window.srcVersion);
const { Tool } = await import('./svision/js/tool.js?ver='+window.srcVersion);
const { ZXColor } = await import('./svision/js/platform/canvas2D/zx/zxColor.js?ver='+window.srcVersion);
// begin code

/**
 * The room: the layout, the objects moving in it and the flashing cells, drawn
 * in layers so that the sprites sit between the paper and the ink of the static
 * tiles — and twice, once per FLASH phase, because a cell with the FLASH bit
 * swaps its ink and paper every 16 frames:
 *
 * ```
 * cache 0 / 1 — paper of the layout cells, normal / flash phase
 *   |  drawSubEntities() — Willy, guardians, items, conveyors, ropes …
 * cache 2 / 3 — ink of the static tiles and ramps, normal / flash phase
 * ```
 *
 * All four are frames of a {@link RasterEntity}, painted once per room (or per
 * colour change) and blitted every draw according to `stack.flashState`. A tile
 * is decoded once into a `Uint32Array(64)` stamp in `graphicCache` — a flashing
 * tile into two, one per phase — and stamped wherever the layout puts it; until
 * 2026-09-06 each stamp was its own `DrawingCache` canvas put down with
 * `drawImage()`, and the flash phase was handled by wiping the flashing stamps
 * between the two ink passes.
 *
 * A conveyor with a paper of its own recolours Willy where he stands on it —
 * the cell's attribute is the conveyor's, so his pixels take its ink. That is
 * told to the sprite (`SpriteEntity.setTints`) before the sprites are drawn,
 * and drawn last (`drawTints()`), because the conveyor is a sprite added after
 * Willy and would cover the lit part otherwise.
 */
export class GameAreaEntity extends RasterEntity {

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
    /** tile hex (plus '|flash' for the flash phase of a flashing tile) -> Uint32Array(64) */
    this.graphicCache = {};

    this.spriteEntities = {conveyors: [], ropes: [], guardians: [], items: [], switches: [], willy: [], ramps: []};
  } // constructor

  drawEntity() {
    if (this.roomData) {
      var graphicData = this.roomData.graphicData;
      var roomBkColor = ZXColor.attrColor(Tool.hexToInt(this.roomData.bkColor), 56, 8);

      this.app.layout.paint(this, 0, 0, this.width, this.height, this.bkColor);

      this.conveyWilly();

      // paper, one frame per FLASH phase: a flashing cell shows its ink colour
      // as paper in the flash phase
      for (var f = 0; f < 2; f++) {
        var paper = this.drawingCache[f];
        if (paper.preparePaint(this.width, this.height)) {
          var frame = this.frameBytes(paper);
          this.pixels.fill(0);
          // layout - bkColor
          this.roomData.layout.forEach((row, r) => {
            for (var column = 0; column < 32; column++) {
              var item = Tool.binToInt(Tool.hexToBin(row.substring(Math.floor(column/4)*2, Math.floor(column/4)*2+2)).substring(column%4*2, column%4*2+2));
              var idItem = this.layoutObjects[item];
              if (idItem !== false) {
                var attr = Tool.hexToInt(graphicData[idItem].substring(0, 2));
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
                    this.paintRect(column*8, r*8, 8, 8, bkColor);
                  }
                }
              }
            }
          });

          // walls & floors & nasties - bkColor
          ['walls', 'floors', 'nasties'].forEach((objectType) => {
            if (objectType in graphicData) {
              graphicData[objectType].forEach((objData) => {
                var attr = Tool.hexToInt(objData.data.substring(0, 2));
                var penColor = this.penColorByAttr(attr);
                var bkColor = this.bkColorByAttr(attr);
                if (bkColor == roomBkColor) {
                  bkColor = false;
                }
                if (f == 1 && (attr&128) == 128) {
                  bkColor = penColor;
                }
                if (bkColor != false) {
                  this.locationsOf(objData).forEach((location) => {
                    for (var w = 0; w < objData.width; w++) {
                      for (var h = 0; h < objData.height; h++) {
                        this.paintRect((location.x+w)*8, (location.y+h)*8, 8, 8, bkColor);
                      }
                    }
                  });
                }
              });
            }
          });
          paper.ctx.putImageData(frame, 0, 0);
        }
      }

      this.blitCache(this.app.stack.flashState ? 1 : 0);

      this.drawSubEntities();

      // ink, one frame per FLASH phase: the tiles and the ramps stamped where
      // the layout puts them; only a flashing tile differs between the phases
      for (var f = 2; f < 4; f++) {
        var ink = this.drawingCache[f];
        if (ink.preparePaint(this.width, this.height)) {
          var frame = this.frameBytes(ink);
          var flashPhase = (f == 3);
          this.pixels.fill(0);
          // layout - penColor
          this.roomData.layout.forEach((row, r) => {
            for (var column = 0; column < 32; column++) {
              var item = Tool.binToInt(Tool.hexToBin(row.substring(Math.floor(column/4)*2, Math.floor(column/4)*2+2)).substring(column%4*2, column%4*2+2));
              var idItem = this.layoutObjects[item];
              if (idItem !== false) {
                this.stamp(this.tileStamp(graphicData[idItem], roomBkColor, flashPhase), column*8, r*8);
              }
            }
          });

          // walls & floors & nasties - penColor
          ['walls', 'floors', 'nasties'].forEach((objectType) => {
            if (objectType in graphicData) {
              graphicData[objectType].forEach((objData) => {
                var stamp = this.tileStamp(objData.data, roomBkColor, flashPhase);
                this.locationsOf(objData).forEach((location) => {
                  for (var w = 0; w < objData.width; w++) {
                    for (var h = 0; h < objData.height; h++) {
                      this.stamp(stamp, (location.x+w)*8, (location.y+h)*8);
                    }
                  }
                });
              });
            }
          });

          // ramps
          this.layoutExtends.ramps.forEach((rampData) => {
            var gradient = (rampData.gradient == 'left') ? -1 : 1;
            var stamp = this.rampStamp(rampData.data, roomBkColor);
            this.locationsOf(rampData).forEach((location) => {
              for (var pos = 0; pos < rampData.length; pos++) {
                this.stamp(stamp, (location.x+pos*gradient)*8, (location.y-pos)*8);
              }
            });
          });
          ink.ctx.putImageData(frame, 0, 0);
        }
      }

      this.blitCache(this.app.stack.flashState ? 3 : 2);

      // Willy's lit parts last: above the conveyor that lights them and above
      // the ink — where the original's attribute puts them
      if (!this.demo && this.spriteEntities.willy.length > 0) {
        this.spriteEntities.willy[0].drawTints();
      }
    }
  } // drawEntity

  /**
   * The places an object of the room data stands at — one `location` or a list
   * of `locations`, the data has both shapes.
   * @param {Object} objData - An entry of graphicData.walls/floors/nasties/ramps.
   * @returns {Object[]} [{x, y}] in cells.
   */
  locationsOf(objData) {
    return ('locations' in objData) ? objData.locations : [objData.location];
  } // locationsOf

  /**
   * Puts an 8x8 stamp onto the current frame at a pixel position. Transparent
   * pixels of the stamp (0) leave what is there, the way `drawImage()` did.
   * @param {Uint32Array} stamp - 64 packed pixels, row by row.
   * @param {number} x - Left edge in pixels.
   * @param {number} y - Top edge in pixels.
   */
  stamp(stamp, x, y) {
    var px = this.pixels;
    var stride = this.imageData.width;
    var at = y*stride+x;
    for (var row = 0; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
        var value = stamp[row*8+col];
        if (value !== 0) {
          px[at+row*stride+col] = value;
        }
      }
    }
  } // stamp

  /**
   * The ink of one static tile as a stamp: its set bits in the tile's ink — or,
   * in the flash phase of a flashing tile (attribute bit 7), in its paper, since
   * FLASH swaps the two. Decoded on first use, kept until the colours change.
   *
   * A flashing tile whose paper is the room's paper used to get `false` for a
   * colour here, which `fillRect` silently painted in whatever colour was set
   * last; it now gets the room's paper, which is what the swap means.
   * @param {string} hex - The tile: attribute byte and 8 bytes of bitmap as hex.
   * @param {string} roomBkColor - The room's paper colour.
   * @param {boolean} flashPhase - Whether this is the flash phase.
   * @returns {Uint32Array} 64 pixels, 0 where the tile is transparent.
   */
  tileStamp(hex, roomBkColor, flashPhase) {
    var attr = Tool.hexToInt(hex.substring(0, 2));
    var flashing = flashPhase && (attr&128) == 128;
    var key = flashing ? hex+'|flash' : hex;
    var stamp = this.graphicCache[key];
    if (!stamp) {
      var penColor = this.penColorByAttr(attr);
      if (flashing) {
        var bkColor = this.bkColorByAttr(attr);
        penColor = (bkColor == false || bkColor == roomBkColor) ? roomBkColor : bkColor;
      }
      stamp = this.bitsStamp(hex, RasterEntity.colorValue(penColor), 0);
      this.graphicCache[key] = stamp;
    }
    return stamp;
  } // tileStamp

  /**
   * The stamp of one ramp piece: its paper (when it differs from the room's)
   * under its set bits. Ramps do not flash — bit 7 of their attribute is masked
   * off, as it always was.
   * @param {string} hex - The piece: attribute byte and 8 bytes of bitmap as hex.
   * @param {string} roomBkColor - The room's paper colour.
   * @returns {Uint32Array} 64 pixels.
   */
  rampStamp(hex, roomBkColor) {
    var stamp = this.graphicCache[hex];
    if (!stamp) {
      var attr = Tool.hexToInt(hex.substring(0, 2));
      var penColor = (this.monochromeColor !== false) ? this.monochromeColor : ZXColor.penAttrColor(attr);
      var bkColor = ZXColor.bkAttrColor(attr&63);
      var paper = (bkColor == roomBkColor) ? 0 : RasterEntity.colorValue(bkColor);
      stamp = this.bitsStamp(hex, RasterEntity.colorValue(penColor), paper);
      this.graphicCache[hex] = stamp;
    }
    return stamp;
  } // rampStamp

  /**
   * Decodes the 8 bitmap bytes of a tile into a stamp.
   * @param {string} hex - Attribute byte and 8 bytes of bitmap as hex.
   * @param {number} ink - Packed colour of a set bit.
   * @param {number} paper - Packed colour of a clear bit, 0 for transparent.
   * @returns {Uint32Array} 64 pixels.
   */
  bitsStamp(hex, ink, paper) {
    var stamp = new Uint32Array(64);
    for (var y = 0; y < 8; y++) {
      var bits = Tool.hexToInt(hex.substring((y+1)*2, (y+1)*2+2));
      for (var x = 0; x < 8; x++) {
        stamp[y*8+x] = (bits & (0x80 >> x)) ? ink : paper;
      }
    }
    return stamp;
  } // bitsStamp

  /**
   * Tells Willy which parts of him a conveyor with a paper of its own lights
   * this frame — the cell's attribute is the conveyor's, so his pixels there
   * take its ink. Called before the sprites are drawn.
   */
  conveyWilly() {
    if (this.demo || this.spriteEntities.willy.length == 0) {
      return;
    }
    var obj = this.spriteEntities.willy[0];
    var tints = [];
    var c = 0;
    while (c < this.spriteEntities.conveyors.length && !this.spriteEntities.conveyors[c].hide) {
      var conveyor = this.spriteEntities.conveyors[c];
      if (conveyor.bkColor !== false) {
        if (!(obj.x+obj.width <= conveyor.x || obj.y+obj.height <= conveyor.y || obj.x >= conveyor.x+conveyor.width || obj.y >= conveyor.y+conveyor.height)) {
          var x = Math.max(obj.x, conveyor.x);
          var y = Math.max(obj.y, conveyor.y);
          tints.push({
            x: x-obj.x, y: y-obj.y,
            width: Math.min(obj.x+obj.width, conveyor.x+conveyor.width)-x,
            height: Math.min(obj.y+obj.height, conveyor.y+conveyor.height)-y,
            color: conveyor.penColor
          });
        }
      }
      c++;
    }
    obj.setTints(tints);
  } // conveyWilly

  setData(data) {
    this.roomData = data;

    var graphicData = data.graphicData;
    if ('ramps' in graphicData) {
      this.layoutExtends.ramps = [...graphicData.ramps];
    }

    if ('extends' in graphicData) {
      data.layout.forEach((row, r) => {
        for (var column = 0; column < 32; column++) {
          var item = Tool.binToInt(Tool.hexToBin(row.substring(Math.floor(column/4)*2, Math.floor(column/4)*2+2)).substring(column%4*2, column%4*2+2));
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

    this.bkColor = ZXColor.attrColor(Tool.hexToInt(data.bkColor), 56, 8);
    this.bkColorForRestore = this.bkColor;

    // Willy
    this.initData.willy = [];
    if (!this.demo) {
      var penColor = ZXColor.penAttrColor(Tool.hexToInt(data.willy.attribute));
      var entity = new SpriteEntity(this, this.app.willyRoomsCache.x+data.willy.paintCorrections.x, this.app.willyRoomsCache.y, penColor, false, this.app.willyRoomsCache.frame, this.app.willyRoomsCache.direction);
      this.addEntity(entity);
      entity.setGraphicsData(data.willy);
      // his lit parts (conveyWilly) go on last, over the conveyor drawn after him
      // and over the ink of the tiles — the cell's attribute colours it all
      entity.deferTints = true;
      this.spriteEntities.willy.push(entity);
      this.app.willyRoomsCache.paintCorrections = {...data.willy.paintCorrections};
      this.app.willyRoomsCache.blankMargins = SpriteTool.buildBlankMargins(data.willy);
      this.initData.willy.push(this.app.willyRoomsCache);
    }

    // the layout caches and the tile stamps are built again on the next draw
    this.cleanCache();

    // layout
    this.initData.floors = [];
    this.initData.walls = [];
    this.initData.nasties = [];
    data.layout.forEach((row, r) => {
      for (var column = 0; column < 32; column++) {
        var item = Tool.binToInt(Tool.hexToBin(row.substring(Math.floor(column/4)*2, Math.floor(column/4)*2+2)).substring(column%4*2, column%4*2+2));
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

    // walls & floors & nasties
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
        var attr = Tool.hexToInt(conveyorData.data.substring(0, 2));
        var penColor = ZXColor.penAttrColor(attr);
        var bkColor = ZXColor.bkAttrColor(attr);
        if (bkColor == this.bkColor) {
          bkColor = false;
        }
        var entity = new SpriteEntity(this, conveyorData.location.x*8, conveyorData.location.y*8, penColor, bkColor, 0, 0);
        entity.setFixSize(8, 8);
        entity.setRepeatX(conveyorData.length);
        var conveyorSpriteData = conveyorData.data.substring(2, 18);
        var conveyorSprite = SpriteTool.decodeHexStr(conveyorSpriteData);
        entity.setGraphicsData(conveyorSprite);
        var rotateDirection = 1;
        if (conveyorData.moving == 'right') {
          rotateDirection = -1;
        }
        for (var f = 1; f <= 3; f++) {
          var grid = SpriteTool.rotateRow(conveyorSprite.sprite, 0, -2*f*rotateDirection);
          grid = SpriteTool.rotateRow(grid, 2, 2*f*rotateDirection);
          entity.addFrameData(grid, false);
        }
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
            var hexStr = Tool.intToHex((Tool.hexToInt(conveyorSpriteData.substring(s*2, s*2+2))^255));
            hexStr.padStart(2, '0');
            reverseSpriteData = reverseSpriteData+hexStr;
          }
          var reverseGrid = SpriteTool.decodeHexStr(reverseSpriteData).sprite;
          entity.addFrameData(reverseGrid, false);
          for (var f = 1; f <= 3; f++) {
            var grid = SpriteTool.rotateRow(reverseGrid, 0, -2*f*rotateDirection);
            grid = SpriteTool.rotateRow(grid, 2, 2*f*rotateDirection);
            entity.addFrameData(grid, false);
          }
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
        var color = ZXColor.penAttrColor(Tool.hexToInt(ropeData.attribute));
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
                var penColor = ZXColor.penAttrColor(Tool.hexToInt(guardian.attribute));
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
                guardianInitData.blankMargins = SpriteTool.buildBlankMargins(guardianDefs);
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
        var penColor0 = ZXColor.color(tmpColor);
        tmpColor = Tool.cycleInc(tmpColor, 3, 6);
        var penColor1 = ZXColor.color(tmpColor);
        tmpColor = Tool.cycleInc(tmpColor, 3, 6);
        var penColor2 = ZXColor.color(tmpColor);
        tmpColor = Tool.cycleInc(tmpColor, 3, 6);
        var penColor3 = ZXColor.color(tmpColor);
        var entity = new SpriteEntity(this, item.x*8, item.y*8, false, false, 0, 0);
        this.addEntity(entity);
        entity.setSharedPalette({1: {0: penColor0, 1: penColor1, 2: penColor2, 3: penColor3}});
        var itemSprite = SpriteTool.decodeHexStr(graphicData.item);
        entity.setGraphicsData(itemSprite);
        for (var f = 0; f < 3; f++) {
          entity.addFrameData(itemSprite.sprite, false);
        }
        this.spriteEntities.items.push(entity);
        this.initData.items.push({id: item.id, hide: false, x: item.x*8, y: item.y*8, width: 8, height: 8, frame: 0, direction: 0});
        if (!('matchColorsOfItems' in data) && (!data.matchColorsOfItems)) {
          itemColor = Tool.cycleInc(itemColor, 3, 6);
        }
      }
    });


    // switches
    this.initData.switches = [];
    if ('switches' in data) {
      data.switches.forEach((switche) => {
        var penColor = ZXColor.penAttrColor(Tool.hexToInt(switche.attribute));
        var bkColor = ZXColor.bkAttrColor(Tool.hexToInt(switche.attribute));
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


  /**
   * Invalidates all four layout caches and throws the stamps away, so that a
   * change of colour (setBkColor, setMonochromeColors) repaints everything; the
   * stamps carry the colours, which is why they cannot stay.
   */
  cleanCache() {
    for (var f = 0; f < 4; f++) {
      this.drawingCache[f].cleanCache();
    }
    this.graphicCache = {};
  } // cleanCache

  penColorByAttr(attr) {
    if (this.monochromeColor) {
      return this.monochromeColor;
    }
    return ZXColor.penAttrColor(attr);
  } // penColorByAttr

  bkColorByAttr(attr) {
    if (this.monochromeColor) {
      return false;
    }
    return ZXColor.bkAttrColor(attr);
  } // bkColorByAttr

  restoreBkColor() {
    if (this.restoreBkColor !== false) {
      this.bkColor = this.bkColorForRestore;
    }
  } // restoreBkColor

  setMonochromeColors(monochromeColor, bkColor) {
    if (monochromeColor != this.monochromeColor) {
      this.monochromeColor = monochromeColor;
      // setBkColor invalidates the caches only when bkColor changes; the pen color change must do it too
      this.cleanCache();
    }
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
