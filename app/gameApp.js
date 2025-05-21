/**/
const { AbstractApp } = await import('./svision/js/abstractApp.js?ver='+window.srcVersion);
const { ResetModel } = await import('./resetModel.js?ver='+window.srcVersion);
const { MenuModel } = await import('./menuModel.js?ver='+window.srcVersion);
const { MainModel } = await import('./mainModel.js?ver='+window.srcVersion);
const { RoomModel } = await import('./roomModel.js?ver='+window.srcVersion);
const { GameOverModel } = await import('./gameOverModel.js?ver='+window.srcVersion);
const { TapeLoadingModel } = await import('./tapeLoadingModel.js?ver='+window.srcVersion);
/*/
import AbstractApp from './svision/js/abstractApp.js';
import ResetModel from './resetModel.js';
import MenuModel from './menuModel.js';
import MainModel from './mainModel.js';
import RoomModel from './roomModel.js';
import GameOverModel from './gameOverModel.js';
import TapeLoadingModel from './tapeLoadingModel.js';
/**/
// begin code

export class GameApp extends AbstractApp {
  
  constructor(platform, wsURL) {
    super(platform, 'bodyApp',  wsURL);

    this.sound = 0.3;
    this.music = 0.3;
    
    this.roomNumber = false;
    this.globalData = false;
    this.items = [];
    this.model = this.newModel('ResetModel');
    this.model.init();

    this.gamePad = false;
  } // constructor

  newModel(model) {
    switch (model) {
      case 'ResetModel': return new ResetModel(this);
      case 'MenuModel': return new MenuModel(this);
      case 'MainModel': return new MainModel(this);
      case 'RoomModel': return new RoomModel(this, this.roomNumber);
      case 'GameOverModel': return new GameOverModel(this);
      case 'TapeLoadingModel': return new TapeLoadingModel(this);
    } // switch
    return null;
  } // newModel
  
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
