/**/
const { AbstractApp } = await import('./svision/js/abstractApp.js?ver='+window.srcVersion);
const { AudioManager } = await import('./audioManager.js?ver='+window.srcVersion);
const { ResetModel } = await import('./resetModel.js?ver='+window.srcVersion);
const { MenuModel } = await import('./menuModel.js?ver='+window.srcVersion);
const { MainModel } = await import('./mainModel.js?ver='+window.srcVersion);
const { RoomModel } = await import('./roomModel.js?ver='+window.srcVersion);
const { GameOverModel } = await import('./gameOverModel.js?ver='+window.srcVersion);
const { TapeLoadingModel } = await import('./tapeLoadingModel.js?ver='+window.srcVersion);
const { AudioWorkletHandler } = await import('./svision/js/audioWorkletHandler.js?ver='+window.srcVersion);
/*/
import AbstractApp from './svision/js/abstractApp.js';
import AudioManager from './audioManager.js';
import ResetModel from './resetModel.js';
import MenuModel from './menuModel.js';
import MainModel from './mainModel.js';
import RoomModel from './roomModel.js';
import GameOverModel from './gameOverModel.js';
import TapeLoadingModel from './tapeLoadingModel.js';
import AudioWorkletHandler from './svision/js/audioWorkletHandler.js';
/**/
// begin code

export class GameApp extends AbstractApp {
  
  constructor(platform, importPath, wsURL) {
    super(platform, 'bodyApp',  importPath, wsURL);

    this.audioManager = new AudioManager(this);
    
    this.roomNumber = false;
    this.roomName = '';
    this.timeCounter = 0;
    this.timeStr = '';
    this.demo = false;
    this.demoRooms = [];
    this.lives = 7;
    this.globalData = false;
    this.items = [];
    this.totalItems = 0;
    this.itemsCollected = {};
    this.setModel('ResetModel');
  } // constructor

  setModel(model) {
    var needResizeApp = false;
    if (this.model) {
      this.model.shutdown();
      needResizeApp = true;
    }
    switch (model) {
      case 'ResetModel':
        this.model = new ResetModel(this);
        break;
      case 'MenuModel':
        this.model = new MenuModel(this);
        break;
      case 'MainModel':
        this.model = new MainModel(this);
        break;
      case 'RoomModel':
        this.model = new RoomModel(this, this.roomNumber, this.demo);
        break;
      case 'GameOverModel':
        this.model = new GameOverModel(this);
        break;
      case 'TapeLoadingModel':
        this.model = new TapeLoadingModel(this);
        break;
    } // switch
    this.model.init();
    if (needResizeApp) {
      this.resizeApp();
    }
  } // setModel
  
  startRoom(demo, newGame, setInitRoom) {
    if (newGame) {
      this.itemsCollected = {};
      this.timeCounter = 0;
      this.timeStr = ' 7:00am';
      this.lives = 7;
      if (setInitRoom) {
        this.roomNumber = this.globalData.initRoom;
      }
    }
    this.demo = demo;
    this.setModel('RoomModel');
  } // startRoom
  
  setGlobalData(data) {
    this.globalData = data;

    this.items = [];
    var id = 0;
    for (var r = 0; r < this.globalData.roomsCount; r++) {
      this.items.push([]);
    }
    var dataItems = data.items;
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
      this.items[room].push({'x': x, 'y': y, 'id': id});
      id++;
    });
    this.totalItems = id;
  } // setGlobalData

} // class GameApp

export default GameApp;
