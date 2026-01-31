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

    this.roomSelectionEntity = null;
    this.selectionX = this.app.globalData.roomsMap.initPosition.x;
    this.selectionY = this.app.globalData.roomsMap.initPosition.y;
    this.roomsOpened = 81;
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('cyan');
    this.desktopEntity.bkColor = false;
    for (var y = 0; y < this.app.globalData.roomsMap.positions.length; y++) {
      for (var x = 0; x < this.app.globalData.roomsMap.positions[y].length; x++) {
        var roomNumber = this.app.globalData.roomsMap.positions[y][x];
        var posX = (x-this.selectionX+2)*64-32;
        var posY = (y-this.selectionY+2)*38-19;
        var roomMapEntity = new RoomMapEntity(this.desktopEntity, posX, posY, roomNumber, (roomNumber > this.roomsOpened));
        this.desktopEntity.addEntity(roomMapEntity);
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
          switch (key) {        
            case 'ArrowUp':
            case 'GamepadUp':
                this.selectionY--;
                this.roomSelectionEntity.y -= 38;
              return true;
            case 'ArrowDown':
            case 'GamepadDown':
                this.selectionY++;
                this.roomSelectionEntity.y += 38;
              return true;
            case 'ArrowLeft':
            case 'GamepadLeft':
                this.selectionX--;
                this.roomSelectionEntity.x -= 64;
              return true;
            case 'ArrowRight':
            case 'GamepadRight':
                this.selectionX++;
                this.roomSelectionEntity.x += 64;
              return true;
            case 'Enter':
            case 'GamepadOK':
              this.app.roomNumber = this.app.globalData.roomsMap.positions[this.selectionY][this.selectionX];
              this.app.startRoom(false, true, false);
              return true;
            case 'Escape':
            case 'GamepadExit':
              this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 52, 40, 153, 85, 'OPTIONS', 'MenuModel'));
              return true;
          }
        }
        break;        
    }
    
    return false;
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);
    
    this.roomSelectionEntity.loopEntity(timestamp);
    this.drawModel();
  } // loopModel

} // RoomsMapModel

export default RoomsMapModel;
