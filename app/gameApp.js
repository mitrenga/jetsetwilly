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

    this.roomNumber = 0;
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
  
  onClick(e) {
    super.onClick(e);
  
    var prevModelID = this.model.id; 
    this.model = null;
    switch (prevModelID) {
      case 'IntroModel': 
        this.roomNumber = 0;
        this.model = this.newModel('RoomModel');
        break;
      case 'RoomModel': 
        this.roomNumber++;
        if (this.roomNumber < 61) {
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

} // class GameApp

export default GameApp;
