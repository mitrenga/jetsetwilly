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
    this.selectionRoom = 1;
    this.roomsOpened = 10;
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('cyan');
    this.desktopEntity.bkColor = false;
    for (var x = 0; x < 4; x++) {
      for (var y = 0; y < 5; y++) {
        var roomNumber = x+y*4;
        var roomMapEntity = new RoomMapEntity(this.desktopEntity, x*64+3, y*38+3, roomNumber, (roomNumber > this.roomsOpened));
        this.desktopEntity.addEntity(roomMapEntity);
      }
    }
    this.roomSelectionEntity = new RoomSelectionEntity(this.desktopEntity, this.selectionRoom%4*64, Math.floor(this.selectionRoom/4)*38);
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
              if (this.selectionRoom >= 4) {
                this.selectionRoom -= 4;
                this.roomSelectionEntity.y -= 38;
              }
              return true;
            case 'ArrowDown':
            case 'GamepadDown':
              if (this.selectionRoom < 16 && this.selectionRoom+4 <= this.roomsOpened) {
                this.selectionRoom += 4;
                this.roomSelectionEntity.y += 38;
              }
              return true;
            case 'ArrowLeft':
            case 'GamepadLeft':
              if (this.selectionRoom % 4 > 0) {
                this.selectionRoom -= 1;
                this.roomSelectionEntity.x -= 64;
              }
              return true;
            case 'ArrowRight':
            case 'GamepadRight':
              if (this.selectionRoom % 4 < 3 && this.selectionRoom+1 <= this.roomsOpened) {
                this.selectionRoom += 1;
                this.roomSelectionEntity.x += 64;
              }
              return true;
            case 'Enter':
            case 'GamepadOK':
              this.app.roomNumber = this.selectionRoom;
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
