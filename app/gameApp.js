/**/
const { AbstractApp } = await import('./svision/js/abstractApp.js?ver='+window.srcVersion);
const { IntroModel } = await import('./introModel.js?ver='+window.srcVersion);
const { RoomModel } = await import('./roomModel.js?ver='+window.srcVersion);
const { GameOverModel } = await import('./gameOverModel.js?ver='+window.srcVersion);
/*/
import AbstractApp from './svision/js/abstractApp.js';
import IntroModel from './introModel.js';
import RoomModel from './roomModel.js';
import GameOverModel from './gameOverModel.js';
/**/
// begin code

export class GameApp extends AbstractApp {
  
  constructor(platform, wsURL) {
    super(platform, 'bodyApp',  wsURL);

    this.roomNumber = false;
    this.globalData = false;
    this.items = [];
    this.model = this.newModel('IntroModel');
    this.model.init();
  } // constructor

  newModel(model) {
    switch (model) {
      case 'IntroModel': return new IntroModel(this);
      case 'RoomModel': return new RoomModel(this, this.roomNumber);
      case 'GameOverModel': return new GameOverModel(this);
    } // switch
    return null;
  } // newModel
  
  prepnimistnost(key) { // ##################################################################################################################
    if (this.model.id == 'RoomModel') {
      var nextRoom = false;
      var direction = false;
      switch(key) {
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        case 'ArrowUp':
          direction = 'above';
          break;
        case 'ArrowDown':
          direction = 'below';
          break;
      }
      if (direction !== false) {
        nextRoom = this.model.adjoiningRoom[direction];
      }
      if (nextRoom !== false) {
        this.roomNumber = this.hexToInt(nextRoom);
        this.model = this.newModel('RoomModel');
        this.model.init();
        this.resizeApp();
      }
    }
  } // ######################################################################################################################################

  onClick(e) {
    super.onClick(e);
  
    var prevModelID = this.model.id; 
    this.model = null;
    switch (prevModelID) {
      case 'IntroModel': 
        this.roomNumber = this.globalData['initRoom'];
        this.model = this.newModel('RoomModel');
        break;
      case 'RoomModel': 
        this.roomNumber++;
        if (this.roomNumber < this.globalData['roomsCount']) {
          this.model = this.newModel('RoomModel');
        } else {
          this.model = this.newModel('GameOverModel');
        }
        break;
      case 'GameOverModel': 
        this.model = this.newModel('IntroModel');
        break;
    }
    this.model.init();
    this.resizeApp();
  } // onClick

  setGlobalData(data) {
    this.globalData = data;

    this.items = [];
    for (var r = 0; r < this.globalData['roomsCount']; r++) {
      this.items.push([]);
    }
    var dataItems = data['items'];
    dataItems.forEach((item) => {
      var binaryItem = this.hexToBin(item);
      // The location of an item is defined by a pair of bytes. The meaning of the bits in each byte pair is as follows:
      // 15 Most significant bit of the y-coordinate
      // 14 Collection flag (reset=collected, set=uncollected)
      // 8-13 Room number
      // 5-7 Least significant bits of the y-coordinate
      // 0-4 x-coordinate
      var x = this.binToInt(binaryItem.substring(11, 16));
      var y = this.binToInt(binaryItem.substring(0, 1)+binaryItem.substring(8, 11));
      var room = this.binToInt(binaryItem.substring(2, 8));
      this.items[room].push({'x': x, 'y': y});
    });
  } // setGlobalData

} // class GameApp

export default GameApp;
