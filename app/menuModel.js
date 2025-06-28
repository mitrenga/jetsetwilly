/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
const { LogoEntity } = await import('./logoEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
const { PlayerNameEntity } = await import('./playerNameEntity.js?ver='+window.srcVersion);
const { HallOfFameEntity } = await import('./hallOfFameEntity.js?ver='+window.srcVersion);
const { AboutEntity } = await import('./aboutEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import ZXTextEntity from './svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
import LogoEntity from './logoEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
import PlayerNameEntity from './playerNameEntity.js';
import HallOfFameEntity from './hallOfFameEntity.js';
import AboutEntity from './aboutEntity.js';
/**/
// begin code

export class MenuModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'MenuModel';

    this.prevCounter = 0;
    this.gameFrame = 0;
    this.bodyObjects = [
      {'id': 'body', 'trackX': 0,  'trackY': 26, 'color': 'rgb(217, 41, 188)'},
      {'id': 'body', 'trackX': 8, 'trackY': 29, 'color': 'rgb(230, 241, 13)'},
      {'id': 'body', 'trackX': 16, 'trackY': 32, 'color': 'rgb(90, 72, 209)'},
      {'id': 'body', 'trackX': 24, 'trackY': 35, 'color': 'rgb(42, 165, 63)'},
      {'id': 'body', 'trackX': 32, 'trackY': 38, 'color': 'rgb(192, 81, 81)'}
    ];
    this.dataLoaded = false;
    this.bodyEntities = [];
    this.headEntity = null;
    this.headX = -16;
    this.headDirectionX = 2;
    this.headY = 150;
    this.headDirectionY = 0;
    this.track = [];
    for (var t = 0; t < 40; t++) {
      this.track[t] = {'x': this.headX, 'y': this.headY, 'direction': 0};
    }
    this.wave = [0, 2, 4, 5, 6, 7, 7, 7, 6, 5, 4, 2, 0, -2, -4, -5, -6, -7, -7, -7, -6, -5, -4, -2];
    this.waveCounter = 0;
    this.willyEntity = null;
    this.selectedItem = 0;
    this.bkEntity = null;
    this.menuSelectedRow = null;
    this.penMenuItemColor = 'rgb(127, 127, 127)';
    this.penSelectedMenuItemColor = 'rgb(0, 0, 0)';
    this.menuEntities = [];
    this.menuItems = [
      {'label': 'START GAME', 'event': 'startGame'},
      {'label': 'PLAYER NAME', 'event': 'setPlayerName'},
      {'label': 'HALL OF FAME', 'event': 'showHallOfFame'},
      {'label': 'SOUNDS', 'event': 'setSounds'},
      {'label': 'MUSIC', 'event': 'setMusic'},
      {'label': 'CONTROLS', 'event': 'showControls'},
      {'label': 'SHOW TAPE LOADING', 'event': 'startTapeLoading'},
      {'label': 'ABOUT GAME', 'event': 'showAbout'}
    ];
    this.logoEntity = null;
    this.copyrightEntity = null;

    const http = new XMLHttpRequest();
    http.responser = this;
    http.open('GET', 'menu.data');
    http.send();

    http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(http.responseText);
        this.responser.sendEvent(1, {'id': 'setMenuData', 'data': data});
      }
    }
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('white');
    this.desktopEntity.bkColor = this.app.platform.colorByName('white');

      this.bodyObjects.forEach((object, o) => {
      this.bodyEntities[o] = new SpriteEntity(this.desktopEntity, this.headX, this.headY, object.color, false, 0, this.track[o].direction);
      this.desktopEntity.addEntity(this.bodyEntities[o]);
    });

    this.headEntity = new SpriteEntity(this.desktopEntity, this.headX, this.headY, 'rgb(21, 147, 181)', false, 0, 0);
    this.desktopEntity.addEntity(this.headEntity);
    this.willyEntity = new SpriteEntity(this.desktopEntity, this.headX-4, this.headY-11, '#7c7c7c', false, 0, 0);
    this.desktopEntity.addEntity(this.willyEntity);

    this.bkEntity = new AbstractEntity(this.desktopEntity, 13, 22, 230, 144, false, 'rgba(223, 218, 208, 0.8)');
    this.desktopEntity.addEntity(this.bkEntity);
    this.menuSelectedRow = new AbstractEntity(this.bkEntity, 10, 10+this.selectedItem*16, 210, 12, false, 'rgba(0, 0, 0, 0.15)');
    this.bkEntity.addEntity(this.menuSelectedRow);

    for (var y = 0; y < this.menuItems.length; y++) {
      var color = this.penMenuItemColor;
      if (y == this.selectedItem) {
        color = this.penSelectedMenuItemColor;
      }
      this.menuEntities[y] = [];
      this.menuEntities[y][0] = new ZXTextEntity(this.bkEntity, 10, 10+y*16, 138, 12, this.menuItems[y].label, color, false, 0, true);
      this.menuEntities[y][0].margin = 2;
      this.bkEntity.addEntity(this.menuEntities[y][0]);
      this.menuEntities[y][1] = new ZXTextEntity(this.bkEntity, 120, 10+y*16, 100, 12, this.menuParamValue(this.menuItems[y].event), color, false, 0, true);
      this.menuEntities[y][1].margin = 2;
      this.menuEntities[y][1].justify = 1;
      this.bkEntity.addEntity(this.menuEntities[y][1]);
    }

    this.logoEntity = new LogoEntity(this.desktopEntity, 144, 6, 93, 10, 'rgb(91, 91, 91)', 'rgb(155, 155, 155)', false, 2);
    this.desktopEntity.addEntity(this.logoEntity);

    this.copyrightEntity = new ZXTextEntity(this.desktopEntity, 0, 23*8, 32*8, 8, '© 2025 GNU General Public Licence', this.app.platform.colorByName('black'), false, 0, true);
    this.copyrightEntity.justify = 2;
    this.desktopEntity.addEntity(this.copyrightEntity);

    this.app.stack.flashState = false;
    this.sendEvent(330, {'id': 'changeFlashState'});
  } // init

  menuParamValue(event) {
    switch (event) {
      case 'setPlayerName':
        return 'libmit';
      case 'setSounds':
        if (this.app.audioManager.sounds == 0) {
          return 'OFF';
        }
        return 'ON';
      case 'setMusic':
        if (this.app.audioManager.music == 0) {
          return 'OFF';
        }
        return 'ON';
    }
    return '';
  } // menuParamValue

  refreshMenu() {
    for (var y = 0; y < this.menuItems.length; y++) {
      this.menuEntities[y][0].setText(this.menuItems[y].label);
      this.menuEntities[y][1].setText(this.menuParamValue(this.menuItems[y].event));
    }
  } // refreshMenu

  changeMenuItem(newItem) {
    if (newItem < 0 || newItem >= this.menuItems.length) {
      return;
    }
    this.menuEntities[this.selectedItem][0].setPenColor(this.penMenuItemColor);
    this.menuEntities[this.selectedItem][1].setPenColor(this.penMenuItemColor);
    this.selectedItem = newItem;
    this.menuEntities[this.selectedItem][0].setPenColor(this.penSelectedMenuItemColor);
    this.menuEntities[this.selectedItem][1].setPenColor(this.penSelectedMenuItemColor);
    this.menuSelectedRow.y = 10+this.selectedItem*16;
  } // changeMenuItem

  setData(data) {
    this.bodyEntities.forEach((entity, e) => {
      entity.setGraphicsData(data.body);
      entity.enablePaintWithVisibility();
    });

    this.headEntity.setGraphicsData(data.head);
    this.headEntity.enablePaintWithVisibility();
    this.willyEntity.setGraphicsData(data.willy);
    this.willyEntity.enablePaintWithVisibility();
    this.dataLoaded = true;
    super.setData(data);
  } // setData

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {

      case 'startGame': 
        this.app.model.shutdown();
        this.app.model = this.app.newModel('MainModel');
        this.app.model.init();
        this.app.resizeApp();
        return true;
      
      case 'startTapeLoading': 
        this.app.model.shutdown();
        this.app.model = this.app.newModel('TapeLoadingModel');
        this.app.model.init();
        this.app.resizeApp();
        return true;

      case 'setSounds':
        if (this.app.audioManager.sounds == 0) {
          this.app.audioManager.sounds = 0.2;
        } else {
          this.app.audioManager.sounds = 0;
        }
        this.app.setCookie('audioChannelSounds', this.app.audioManager.sounds);
        this.refreshMenu();
        return true;

      case 'setMusic':
        if (this.app.audioManager.music == 0) {
          this.app.audioManager.music = 0.2;
        } else {
          this.app.audioManager.music = 0;
        }
        this.app.setCookie('audioChannelMusic', this.app.audioManager.music);
        this.refreshMenu();
        return true;
    
      case 'setPlayerName':
        this.desktopEntity.addModalEntity(new PlayerNameEntity(this.desktopEntity, 28, 42, 200, 100));
      return true;

      case 'showHallOfFame':
        this.desktopEntity.addModalEntity(new HallOfFameEntity(this.desktopEntity, 28, 26, 200, 132));
      return true;

      case 'showAbout':
        this.desktopEntity.addModalEntity(new AboutEntity(this.desktopEntity, 28, 26, 200, 132));
      return true;

      case 'changeFlashState':
        this.app.stack.flashState = !this.app.stack.flashState;
        this.sendEvent(330, {'id': 'changeFlashState'});
        return true;

      case 'keyPress':
        switch (event.key) {
          case 'Enter':
          case ' ':
              this.sendEvent(0, {'id': this.menuItems[this.selectedItem].event});
            return true;
          case 'ArrowDown':
            this.changeMenuItem(this.selectedItem+1);
            return true;
          case 'ArrowUp':
            this.changeMenuItem(this.selectedItem-1);
            return true;
          }
        break;

      case 'mouseClick':
        if (event.key == 'left') {
          for (var i = 0; i < this.menuItems.length; i++) {
            if ((this.menuEntities[i][0].pointOnEntity(event)) || (this.menuEntities[i][1].pointOnEntity(event))) {
              this.changeMenuItem(i);
              this.sendEvent(0, {'id': this.menuItems[this.selectedItem].event});
              return true;
            }
          }
        }
        break;

      case 'setMenuData':
        this.setData(event.data);
        return true;
    }

    return false;
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);

    if (this.timer === false) {
      this.timer = timestamp;
    } else {
      if (this.dataLoaded) {
        var counter = Math.round((timestamp-this.timer)/72);
        if (this.prevCounter != counter) {
          this.prevCounter = counter;
          this.gameFrame = this.app.rotateInc(this.gameFrame, 0, 14);
      
          // head
          if (this.gameFrame%2 == 0) {
            this.headEntity.incFrame();
          }
          this.headX += this.headDirectionX;
          if (this.headEntity.drawingCropCache != null && this.headX >= 0) {
            this.headEntity.disablePaintWithVisibility();
          }
          if (this.headDirectionX > 0 && this.headX > 235) {
            this.headDirectionX *= -1;
            this.headEntity.switchDirection();
            this.headDirectionY = Math.round(Math.random()*2)-1;
            if (this.headDirectionY != 0) {
              this.headY += this.wave[this.waveCounter];
              this.waveCounter = 0;
            }
          }
          if ((this.headDirectionX > 0 && this.headX > 235) ||
              (this.headDirectionX < 0 && this.headX < 6)) {
            this.headDirectionX *= -1;
            this.headEntity.switchDirection();
            this.headDirectionY = Math.round((Math.random()*4)-2)/2;
            if (this.headDirectionY != 0) {
              this.headY += this.wave[this.waveCounter];
              this.waveCounter = 0;
            }
          }
          this.headY += this.headDirectionY;
          if (this.headDirectionY > 0 && this.headY > 160) {
            this.headDirectionY *= -1;
          }
          if (this.headDirectionY < 0 && this.headY < 12) {
            this.headDirectionY *= -1;
          }
          this.headEntity.x = this.headX;
          this.headEntity.y = this.headY+this.wave[this.waveCounter];
          if ((this.waveCounter > 0) || (this.headDirectionY == 0)) {
            this.waveCounter = this.app.rotateInc(this.waveCounter, 0, this.wave.length-1);
          }

          // Willy
          if (this.headDirectionX > 0) {
            this.willyEntity.x = this.headEntity.x-4;
          } else {
            this.willyEntity.x = this.headEntity.x+10;
          }
          if (this.willyEntity.drawingCropCache != null && this.willyEntity.x >= 0) {
            this.willyEntity.disablePaintWithVisibility();
          }
          this.willyEntity.y = this.headEntity.y-11;
          this.willyEntity.direction = this.headEntity.direction;
          if (this.gameFrame == 1 || this.gameFrame == 4) {
            this.willyEntity.incFrame();
          }

          // body
          this.bodyEntities.forEach((entity, e) => {
            entity.x = this.track[this.bodyObjects[e].trackX].x;
            entity.y = this.track[this.bodyObjects[e].trackY].y;
            entity.direction = this.track[this.bodyObjects[e].trackX].direction;
            if (this.gameFrame%4 == 0) {
              entity.incFrame();
            }
            if (entity.drawingCropCache != null && entity.x >= 0) {
              entity.disablePaintWithVisibility();
            }
          });
          this.track.shift();
          this.track.push({'x': this.headEntity.x, 'y': this.headEntity.y, 'direction': this.headEntity.direction});
        }
      }
    }
  
    this.drawModel();
  } // loopModel

} // class MenuModel

export default MenuModel;
