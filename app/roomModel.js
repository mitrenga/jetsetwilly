/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
const { RoomEntity } = await import('./roomEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import ZXTextEntity from '././svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
import RoomEntity from './roomEntity.js';
/**/
// begin code

export class RoomModel extends AbstractModel {
  
  constructor(app, roomNumber) {
    super(app);
    this.id = 'RoomModel';

    this.roomNumber = roomNumber;
    this.roomEntity = null;
    this.airEntity = null;
    this.roomNameEntity = null;
    this.scoreEntity = null;
    this.adjoiningRoom = null;
    
    const http = new XMLHttpRequest();
    http.responser = this;
    http.open('GET', 'room'+this.roomNumber.toString().padStart(2, '0')+'.data');
    http.send();

    http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(http.responseText);
        this.responser.sendEvent(1, {'id': 'setRoomData', 'data': data});
      }
    }
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('black');
    this.roomEntity = new RoomEntity(this.desktopEntity, 0, 0, 32*8, 16*8);
    this.desktopEntity.addEntity(this.roomEntity);
    this.roomNameEntity = new ZXTextEntity(this.desktopEntity, 0, 16*8, 32*8, 8, '', this.app.platform.colorByName('brightYellow'), this.app.platform.colorByName('brightBlack'), 0, true);
    this.roomNameEntity.justify = 2;
    this.desktopEntity.addEntity(this.roomNameEntity);
  } // init

  setData(data) {
    this.roomNameEntity.text = data['name'];
    this.borderEntity.bkColor = this.app.platform.zxColorByAttribut(this.app.hexToInt(data['borderColor']), 7, 1);
    
    super.setData(data);
  } // setData

  handleEvent(event) {
    if (event['id'] == 'setRoomData') {
      this.adjoiningRoom = event['data']['adjoiningRoom'];
      this.setData(event['data']);
      return true;
    }

    return super.handlEvent(event);
  } // handleEvent

} // class RoomModel

export default RoomModel;
