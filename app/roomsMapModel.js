/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { BorderEntity } = await import('./borderEntity.js?ver='+window.srcVersion);
const { RoomMapEntity } = await import('./roomMapEntity.js?ver='+window.srcVersion);
const { RoomSelectionEntity } = await import('./roomSelectionEntity.js?ver='+window.srcVersion);
const { PauseGameEntity } = await import('./pauseGameEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import BorderEntity from './borderEntity.js';
import RoomMapEntity from './roomMapEntity.js';
import RoomSelectionEntity from './roomSelectionEntity.js';
import PauseGameEntity from './pauseGameEntity.js';
/**/
// begin code

export class RoomsMapModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'RoomsMapModel';

    this.roomsMapEntities = [];
    this.adjustX = 0;
    this.adjustY = 0;

    this.roomSelectionEntity = null;
    this.selectionX = this.app.globalData.roomsMap.initPosition.x;
    this.selectionY = this.app.globalData.roomsMap.initPosition.y;
    this.adjustSelectionX = 0;
    this.adjustSelectionY = 0;

    this.wheelDeltaX = 0;
    this.wheelDeltaY = 0;
    this.mouseDraggingX = 0;
    this.mouseDraggingY = 0;
    this.isMouseDragging = false;
    this.touchesDragging = {};

    this.prevTimestamp = false;
    
    this.roomsOpened = 81; // temporary
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('cyan');
    this.desktopEntity.bkColor = this.app.platform.colorByName('black');
    for (var y = 0; y < this.app.globalData.roomsMap.positions.length; y++) {
      this.roomsMapEntities.push([]);
      for (var x = 0; x < this.app.globalData.roomsMap.positions[y].length; x++) {
        this.roomsMapEntities[y].push(null);
        var roomNumber = this.app.globalData.roomsMap.positions[y][x];
        if (roomNumber !== false) {
          var posX = (x-this.selectionX+2)*64-32;
          var posY = (y-this.selectionY+2)*38-19;
          var roomMapEntity = new RoomMapEntity(this.desktopEntity, posX, posY, roomNumber, (roomNumber > this.roomsOpened), x, y);
          this.desktopEntity.addEntity(roomMapEntity);
          this.roomsMapEntities[y][x] = roomMapEntity;
        }
      }
    }
    this.roomSelectionEntity = new RoomSelectionEntity(this.desktopEntity, 2*64-32-3, 2*38-19-3);
    this.desktopEntity.addEntity(this.roomSelectionEntity);

    this.app.stack.flashState = false;
    this.sendEvent(330, {id: 'changeFlashState'});
  } // init

  newBorderEntity() {
    return new BorderEntity(true, false);
  } // newBorderEntity

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'changeFlashState':
        this.app.stack.flashState = !this.app.stack.flashState;
        this.sendEvent(330, {id: 'changeFlashState'});
        return true;

      case 'keyPress':
        if (this.desktopEntity.modalEntity == null) {
          var key = event.key;
          if (key.length == 1) {
            key = key.toUpperCase();
          }
          var roomData = this.roomsMapEntities[this.selectionY][this.selectionX].roomData;
          switch (key) {        
            case 'ArrowUp':
            case 'GamepadUp':
              this.fixSelectionPosition();
              if ('teleport' in roomData && 'above' in roomData.teleport) {
                this.selectAdjoiningRoom(roomData.teleport.above);
              } else {
                if (this.selectionY > 0 && this.app.globalData.roomsMap.positions[this.selectionY-1][this.selectionX] !== false) {
                  this.selectionY--;
                  this.adjustSelectionY -= 38;
                  if (this.roomSelectionEntity.y+this.adjustSelectionY < 0) {
                    this.adjustY += 38;
                  }
                }
              }
              return true;
            case 'ArrowDown':
            case 'GamepadDown':
              this.fixSelectionPosition();
              if ('teleport' in roomData && 'below' in roomData.teleport) {
                this.selectAdjoiningRoom(roomData.teleport.below);
              } else {
                var roomsMapPositions = this.app.globalData.roomsMap.positions;
                if (this.selectionY < roomsMapPositions.length-1 && roomsMapPositions[this.selectionY+1][this.selectionX] !== false) {
                  this.selectionY++;
                  this.adjustSelectionY += 38;
                  if (this.roomSelectionEntity.y+this.adjustSelectionY > 189-38) {
                    this.adjustY -= 38;
                  }
                }
              }
              return true;
            case 'ArrowLeft':
            case 'GamepadLeft':
              this.fixSelectionPosition();
              if ('teleport' in roomData && 'left' in roomData.teleport) {
                this.selectAdjoiningRoom(roomData.teleport.left);
              } else {
                if (this.selectionX > 0 && this.app.globalData.roomsMap.positions[this.selectionY][this.selectionX-1] !== false) {
                  this.selectionX--;
                  this.adjustSelectionX -= 64;
                  if (this.roomSelectionEntity.x+this.adjustSelectionX < 0) {
                    this.adjustX += 64;
                  }
                }
              }
              return true;
            case 'ArrowRight':
            case 'GamepadRight':
              this.fixSelectionPosition();
              if ('teleport' in roomData && 'right' in roomData.teleport) {
                this.selectAdjoiningRoom(roomData.teleport.right);
              } else {
                var roomsMapRowPositions = this.app.globalData.roomsMap.positions[this.selectionY];
                if (this.selectionX < roomsMapRowPositions.length-1 && roomsMapRowPositions[this.selectionX+1] !== false) {
                  this.selectionX++;
                  this.adjustSelectionX += 64;
                  if (this.roomSelectionEntity.x+this.adjustSelectionX > 255-64) {
                    this.adjustX -= 64;
                  }
                }
              }
              return true;
            case 'Enter':
            case 'GamepadOK':
              if (this.adjustX == 0 && this.adjustY == 0 && this.adjustSelectionX == 0 && this.adjustSelectionY == 0) {
                var roomNumber = this.app.globalData.roomsMap.positions[this.selectionY][this.selectionX];
                var extraGame = true;
                if (roomNumber == this.app.globalData.initRoom) {
                  extraGame = false;
                }
                this.app.startRoom(false, true, false, true, extraGame, roomNumber);
              }
              return true;
            case 'Escape':
            case 'GamepadExit':
              this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 52, 40, 153, 85, 'OPTIONS', 'MenuModel'));
              return true;
            case 'Mouse1':
              this.mouseDraggingX = event.x;
              this.mouseDraggingY = event.y;
              break;
            case 'Touch':
              if (this.app.inputEventsManager.touchesMap[event.identifier] === false) {
                this.app.inputEventsManager.touchesMap[event.identifier] = this.desktopEntity;
                this.desktopEntity.clickState = true;
              }
              this.touchesDragging[event.identifier] = {touchDraggingX: event.x, touchDraggingY: event.y, isTouchDragging: false};
              break;
          }
        }
        break;

      case 'keyRelease':
        switch (event.key) {
          case 'Mouse1':
            this.isMouseDragging = false;
            break;
          case 'Touch':
            delete this.touchesDragging[event.identifier];
            break;
        }
        break;

      case 'keyMove':
        switch (event.key) {
          case 'Mouse1':
            var moveX = event.x-this.mouseDraggingX;
            var moveY = event.y-this.mouseDraggingY;
            if (this.isMouseDragging || Math.abs(moveX) > 10 || Math.abs(moveY) > 10) {
              this.moveRooms(moveX, moveY);
              this.isMouseDragging = true;
              this.mouseDraggingX = event.x;
              this.mouseDraggingY = event.y;
            }
            return true;
          case 'Touch':
            var td = this.touchesDragging[event.identifier];
            var moveX = event.x-td.touchDraggingX;
            var moveY = event.y-td.touchDraggingY;
            if (td.isTouchDragging || Math.abs(moveX) > 10 || Math.abs(moveY) > 10) {
              this.moveRooms(moveX, moveY);
              td.isTouchDragging = true;
              td.touchDraggingX = event.x;
              td.touchDraggingY = event.y;
            }
            return true;
        }
        break;

      case 'mouseWheel':
        this.wheelDeltaX += event.deltaX;
        this.wheelDeltaY += event.deltaY;
        if (Math.abs(this.wheelDeltaX) > 120) {
          this.sendEvent(0, {id: 'keyPress', key: (this.wheelDeltaX > 0) ? 'ArrowLeft' : 'ArrowRight'});
          this.wheelDeltaX = 0;
          this.wheelDeltaY = 0;
        }
        if (Math.abs(this.wheelDeltaY) > 120) {
          this.sendEvent(0, {id: 'keyPress', key: (this.wheelDeltaY > 0) ? 'ArrowUp' : 'ArrowDown'});
          this.wheelDeltaX = 0;
          this.wheelDeltaY = 0;
        }
        return true;

      case 'selectRoomMapEntity':
        this.roomSelectionEntity.x += (event.roomsMapX-this.selectionX)*64+this.adjustSelectionX;
        this.adjustX = 0;
        this.adjustSelectionX = 0;
        this.selectionX = event.roomsMapX;
        this.roomSelectionEntity.y += (event.roomsMapY-this.selectionY)*38+this.adjustSelectionY;
        this.adjustY = 0;
        this.adjustSelectionY = 0;
        this.selectionY = event.roomsMapY;
        return true;
    }
    
    return false;
  } // handleEvent

  moveRooms(moveX, moveY) {
    var x1 = false;
    var x2 = false;
    for (var y = 0; y < this.roomsMapEntities.length; y++) {
      var roomMapEntity1 = this.roomsMapEntities[y][0];
      var roomMapEntity2 = this.roomsMapEntities[y][this.roomsMapEntities[0].length-1];
      if (roomMapEntity1 !== null && x1 === false) {
        x1 = roomMapEntity1.x;
      }
      if (roomMapEntity2 !== null && x2 === false) {
        x2 = roomMapEntity2.x+roomMapEntity2.width;
      }
      if (x1 !== false && x2 !== false) {
        break;
      }
    }
    if (x1 !== false && x1+moveX > 32) {
      moveX = 32-x1;
    }
    if (x2 !== false && x2+moveX < 256-32) {
      moveX = 256-32-x2;
    }

    var y1 = false;
    var y2 = false;
    for (var x = 0; x < this.roomsMapEntities[0].length; x++) {
      var roomMapEntity1 = this.roomsMapEntities[0][x];
      var roomMapEntity2 = this.roomsMapEntities[this.roomsMapEntities.length-1][x];
      if (roomMapEntity1 !== null && y1 === false) {
        y1 = roomMapEntity1.y;
      }
      if (roomMapEntity2 !== null && y2 === false) {
        y2 = roomMapEntity2.y+roomMapEntity2.height;
      }
    }
    if (y1 !== false && y1+moveY > 19) {
      moveY = 19-y1;
    }
    if (y2 !== false && y2+moveY < 192-19) {
      moveY = 192-19-y2;
    }

    for (var y = 0; y < this.roomsMapEntities.length; y++) {
      for (var x = 0; x < this.roomsMapEntities[y].length; x++) {
        var roomMapEntity = this.roomsMapEntities[y][x];
        if (roomMapEntity !== null) {
          roomMapEntity.x += moveX;
          roomMapEntity.y += moveY;
        }
      }
    }
    this.roomSelectionEntity.x += moveX;
    this.roomSelectionEntity.y += moveY;
  } // moveRooms

  fixSelectionPosition() {
    if (this.adjustX == 0) {
      while (this.roomSelectionEntity.x+this.adjustX < 0) {
        this.adjustX += 64;
      }
      while (this.roomSelectionEntity.x+this.adjustX > 255-64) {
        this.adjustX -= 64;
      }
      var diffX = (this.roomSelectionEntity.x+this.adjustX-32)%64+3;
      if (diffX < 32) {
        this.adjustX -= diffX;
      } else {
        this.adjustX += 64-diffX;
      }
    }
    if (this.adjustY == 0) {
      while (this.roomSelectionEntity.y+this.adjustY < 0) {
        this.adjustY += 38;
      }
      while (this.roomSelectionEntity.y+this.adjustY > 192-38) {
        this.adjustY -= 38;
      }
      var diffY = (this.roomSelectionEntity.y+this.adjustY-19)%38+3;
      if (diffY < 19) {
        this.adjustY -= diffY;
      } else {
        this.adjustY += 38-diffY;
      }
    }
  } // fixSelectionPosition

  isTouchDragging() {
    var result = false;
    Object.keys(this.touchesDragging).forEach((touchDragging) => {
      if (this.touchesDragging[touchDragging].isTouchDragging) {
        result = true;
      }
    });
    return result;
  } // isTouchDragging

  selectAdjoiningRoom(adjoiningRoom) {
    if (adjoiningRoom !== false) {
      var x = this.app.roomsMapPositions[adjoiningRoom].x;
      var y = this.app.roomsMapPositions[adjoiningRoom].y;
      var deltaX = x - this.selectionX;
      var deltaY = y - this.selectionY;
      this.selectionX = x;
      this.selectionY = y;
      this.adjustSelectionX += deltaX*64;
      this.adjustSelectionY += deltaY*38;

      while (this.roomSelectionEntity.x+this.adjustX+this.adjustSelectionX < 0) {
        this.adjustX += 64;
      }
      while (this.roomSelectionEntity.x+this.adjustX+this.adjustSelectionX > 255-64) {
        this.adjustX -= 64;
      }
      while (this.roomSelectionEntity.y+this.adjustY+this.adjustSelectionY < 0) {
        this.adjustY += 38;
      }
      while (this.roomSelectionEntity.y+this.adjustY+this.adjustSelectionY > 189-38) {
        this.adjustY -= 38;
      }
    }
  } // selectAdjoiningRoom

  loopModel(timestamp) {
    super.loopModel(timestamp);
    
    var timeDelta = 0;
    if (this.prevTimestamp !== false) {
      timeDelta = timestamp - this.prevTimestamp;
    }
    this.prevTimestamp = timestamp;
    
    if (this.adjustX != 0 || this.adjustY != 0) {
      var corrX = 0;
      var corrY = 0;
      if (timeDelta > 0) {
        corrX = Math.max(Math.min(Math.abs(this.adjustX), Math.round(timeDelta/3)), 1)*Math.sign(this.adjustX);
        corrY = Math.max(Math.min(Math.abs(this.adjustY), Math.round(timeDelta/6)), 1)*Math.sign(this.adjustY);
      }
      this.adjustX -= corrX;
      this.adjustY -= corrY;

      for (var y = 0; y < this.roomsMapEntities.length; y++) {
        for (var x = 0; x < this.roomsMapEntities[y].length; x++) {
          var roomMapEntity = this.roomsMapEntities[y][x];
          if (roomMapEntity !== null) {
            roomMapEntity.x += corrX;
            roomMapEntity.y += corrY;
          }
        }
      }
      this.roomSelectionEntity.x += corrX;
      this.roomSelectionEntity.y += corrY;
    }

    if (this.adjustSelectionX != 0 || this.adjustSelectionY != 0) {
      var corrX = 0;
      var corrY = 0;
      if (timeDelta > 0) {
        corrX = Math.max(Math.min(Math.abs(this.adjustSelectionX), Math.round(timeDelta/2.5)), 1)*Math.sign(this.adjustSelectionX);
        corrY = Math.max(Math.min(Math.abs(this.adjustSelectionY), Math.round(timeDelta/5)), 1)*Math.sign(this.adjustSelectionY);
      }
      this.adjustSelectionX -= corrX;
      this.adjustSelectionY -= corrY;

      this.roomSelectionEntity.x += corrX;
      this.roomSelectionEntity.y += corrY;
    }

    this.roomSelectionEntity.loopEntity(timestamp);
    this.drawModel();
  } // loopModel

} // RoomsMapModel

export default RoomsMapModel;
