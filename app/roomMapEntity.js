/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class RoomMapEntity extends AbstractEntity {
  
  constructor(parentEntity, x, y, roomNumber, locked) {
    super(parentEntity, x, y, 64, 38, false, false);
    this.id = 'RoomMapEntity';

    this.roomNumber = roomNumber;
    this.locked = locked;
    this.roomData = null;
    this.mapKinds = ['floor', 'wall', 'nasty'];
    this.layoutObjects = [false, 'floor', 'wall', 'nasty'];
    this.roomNameEntity = null;
    this.padlockEntity = null;

    this.app.layout.newDrawingCache(this, 0);
    this.app.layout.newDrawingCropCache(this);
} // constructor

  init() {
    super.init();

    this.roomNameEntity = new TextEntity(this, this.app.fonts.fonts3x3, 0, 32, 64, 6, '', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlack'), {align: 'center', topMargin: 1});
    this.roomNameEntity.enablePaintWithVisibility();
    this.addEntity(this.roomNameEntity);
    if (this.locked) {
      this.padlockEntity = new SpriteEntity(this, Math.floor((this.width-11)/2), Math.floor((this.height-13)/2), this.app.platform.colorByName('red'), false, 0, 0);
      this.padlockEntity.enablePaintWithVisibility();
      this.padlockEntity.setCompressedGraphicsData('lP100B00D0B040307050209010F080A0G012334140414041415671815696A656', false);
      this.addEntity(this.padlockEntity);
    } 
    var roomId = 'room'+this.roomNumber.toString().padStart(2, '0');
    this.fetchData(roomId+'.data', {key: roomId, when: 'required'}, {});
  } // init

  setData(data) {
    this.roomData = data.data;
    this.roomNameEntity.setText(data.data.shortName);
  } // setData

  drawEntity() {
    var cropX = 0;
    var cropY = 0;
    var moveX = 0;
    var moveY = 0;
    var cropWidth = this.width;
    var cropHeight = this.height;
    if (this.x < 0) {
      cropX = -this.x;
      moveX = cropX;
      cropWidth = this.width-cropX;
    }
    if (this.y < 0) {
      cropY = -this.y;
      moveY = cropY;
      cropHeight = this.height-cropY;
    }
    if (this.x+this.width > this.parentEntity.width) {
      cropX = this.parentEntity.width-this.x-this.width;
      cropWidth = this.width+cropX;
    }
    if (this.y+this.height > this.parentEntity.height) {
      cropY = this.parentEntity.height-this.y-this.height;
      cropHeight = this.height+cropY;
    }

    if (this.roomData) {
      this.app.layout.paint(this, moveX, moveY, cropWidth, cropHeight, this.app.platform.bkColorByAttr(this.app.hexToInt(this.roomData.bkColor)));
      //this.app.layout.paint(this, 0, this.height-6, this.width, 6, this.app.platform.colorByName('black'));

      if (this.drawingCache[0].needToRefresh(this, this.width, this.height)) {

        // layout
        this.roomData.layout.forEach((row, r) => {
          for (var column = 0; column < 32; column++) {
            var item = this.app.binToInt(this.app.hexToBin(row.substring(Math.floor(column/4)*2, Math.floor(column/4)*2+2)).substring(column%4*2, column%4*2+2));
            var idItem = this.layoutObjects[item];
            if (idItem !== false) {
              var attr = this.app.hexToInt(this.roomData.graphicData[idItem].substring(0, 2));
              if (this.mapKinds.includes(idItem)) {
                var penColor = this.app.platform.penColorByAttr(attr);
                var bkColor = this.app.platform.bkColorByAttr(attr);
                if (bkColor == this.app.platform.bkColorByAttr(this.app.hexToInt(this.roomData.bkColor))) {
                  bkColor = false;
                }
                if (bkColor != false) {
                  this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, r*2, 1, 1, bkColor);
                }
                this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, r*2, 1, 1, penColor);
              }
            }
          }
        });

        /*
        this.caveData.layout.forEach((row, r) => {
          for (var column = 0; column < row.length/2; column++) {
            var attr = row.substring(column*2, column*2+2);
            if (attr != this.caveData.bkColor) {
              if (this.mapKinds.includes(this.caveData.graphicData[attr].kind)) {
                var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(attr));
                if (bkColor == this.app.platform.bkColorByAttr(this.app.hexToInt(this.caveData.bkColor))) {
                  bkColor = false;
                }
                if (bkColor != false) {
                  this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, r*2, 2, 2, bkColor);
                }
                var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(attr));
                switch (this.caveData.graphicData[attr].kind) {
                  case 'floor':
                  case 'crumblingFloor':
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, r*2, 2, 1, penColor);
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2+1, r*2+1, 1, 1, penColor);
                    break;
                  case 'wall':
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, r*2, 1, 1, penColor);
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2+1, r*2+1, 1, 1, penColor);
                    break;
                  case 'conveyor':
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, r*2, 2, 1, penColor);
                    break;
                  case 'nasty':
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, r*2, 2, 1, penColor);
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, r*2+1, 1, 1, penColor);
                    break;
                  default:
                    this.app.layout.paintRect(this.drawingCache[0].ctx, column*2, r*2, 2, 2, penColor);
                    break;
                }
              }
            }
          }
        });
        */

        // items
        /*
        this.caveData.items.data.forEach((item) => {
          var itemColor = this.app.platform.color(this.app.hexToInt(item.initAttribute)&7);
          var bkColor = this.app.platform.bkColorByAttr(this.app.hexToInt(item.initAttribute));
          if (bkColor == this.app.platform.bkColorByAttr(this.app.hexToInt(this.caveData.bkColor))) {
            bkColor = false;
          }
          if (bkColor != false) {
            this.app.layout.paintRect(this.drawingCache[0].ctx, item.x*2, item.y*2, 2, 2, bkColor);          
          }
          this.app.layout.paintRect(this.drawingCache[0].ctx, item.x*2, item.y*2, 1, 1, itemColor);
          this.app.layout.paintRect(this.drawingCache[0].ctx, item.x*2+1, item.y*2+1, 1, 1, itemColor);
        });
        */

        // gurdians
        if ('guardians' in this.roomData) {
          ['horizontal', 'vertical', 'maria'].forEach((guardianType) => {
            if (guardianType in this.roomData.guardians) {
              var guardianTypeData = this.roomData.guardians[guardianType];
              guardianTypeData.forEach((guardianDefs) => {
                guardianDefs.figures.forEach((guardian) => {
                  var penColor = this.app.platform.penColorByAttr(this.app.hexToInt(guardian.attribute));
                  if ('mapSprite' in guardianDefs) {
                    for (var r = 0; r < guardianDefs.mapSprite.length; r++) {
                      for (var c = 0; c < guardianDefs.mapSprite[r].length; c++) {
                        if (guardianDefs.mapSprite[r][c] == '#') {
                          if (guardian.init.direction == 1) {
                            this.app.layout.paintRect(this.drawingCache[0].ctx, Math.floor(guardian.init.x/4)+guardianDefs.mapSprite[r].length-c-1, Math.floor(guardian.init.y/4)+r, 1, 1, penColor);
                          } else {
                            this.app.layout.paintRect(this.drawingCache[0].ctx, Math.floor(guardian.init.x/4)+c, Math.floor(guardian.init.y/4)+r, 1, 1, penColor);
                          }
                        }
                      }
                    }
                  } else {
                    this.app.layout.paintRect(
                      this.drawingCache[0].ctx,
                      Math.floor(guardian.init.x/4),
                      Math.floor(guardian.init.y/4),
                      Math.floor(guardianDefs.width/4),
                      Math.floor(guardianDefs.height/4),
                      penColor
                    );
                  }
                });
              });
            }
          });
        }

      }
    }
    
    if (cropX != 0 || cropY != 0) {
      this.app.layout.paintCropCache(this, 0, cropX, cropY, cropX, cropY);
    } else {
      this.app.layout.paintCache(this, 0);
    }
    
    this.drawSubEntity(this.roomNameEntity);

    if (this.locked) {
      this.app.layout.paint(this, moveX, moveY, cropWidth, cropHeight, '#9a9595c0');
      this.drawSubEntity(this.padlockEntity);
    }
  } // drawEntity

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'keyPress':
        switch (event.key) {            
          case 'Mouse1':
            if (!this.locked && this.pointOnEntity(event)) {
              this.app.inputEventsManager.keysMap.Mouse1 = this;
              this.clickState = true;
              return true;
            }
            return false;
          case 'Touch':
            if (!this.locked && this.pointOnEntity(event)) {
              this.app.inputEventsManager.touchesMap[event.identifier] = this;
              this.clickState = true;
              return true;
            }
            return false;
        }
        break;

      case 'keyRelease':
        switch (event.key) {
          case 'Mouse1':
            if (this.pointOnEntity(event)) {
              if (this.app.inputEventsManager.keysMap.Mouse1 === this) {
                this.app.roomNumber = this.roomNumber;
                this.app.startRoom(false, true, false);
                return true;
              }
            }
            break;
          case 'Touch':
            if (this.pointOnEntity(event)) {
              if (this.app.inputEventsManager.touchesMap[event.identifier] === this) {
                this.app.roomNumber = this.roomNumber;
                this.app.startRoom(false, true, false);
                return true;
              }
            }
            break;
        }
        break;
    }
    return false;
  } // handleEvent

} // RoomMapEntity

export default RoomMapEntity;
