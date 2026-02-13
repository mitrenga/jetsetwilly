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
          var roomMapEntity = new RoomMapEntity(this.desktopEntity, posX, posY, roomNumber, (roomNumber > this.roomsOpened));
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
                this.app.startRoom(false, true, true, extraGame, roomNumber);
              }
              return true;
            case 'Escape':
            case 'GamepadExit':
              this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 52, 40, 153, 85, 'OPTIONS', 'MenuModel'));
              return true;
          }
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
    }
    
    return false;
  } // handleEvent

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
      
      if (false) {
        this.adjustX -= deltaX*64;
        this.adjustY -= deltaY*38;
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
