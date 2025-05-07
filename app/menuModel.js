/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
const { LogoEntity } = await import('./logoEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import ZXTextEntity from './svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
import LogoEntity from './logoEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
/**/
// begin code

export class MenuModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'MenuModel';

    this.bwColor = '#7c7c7c';
    this.redraw = false;
    this.gameFrame = 0;
    this.bodyObjects = [
      {'id': 'body', 'trackX': 0,  'trackY': 26, 'color': 'rgb(217, 41, 188)'},
      {'id': 'body', 'trackX': 8, 'trackY': 29, 'color': 'rgb(230, 241, 13)'},
      {'id': 'body', 'trackX': 16, 'trackY': 32, 'color': 'rgb(90, 72, 209)'},
      {'id': 'body', 'trackX': 24, 'trackY': 35, 'color': 'rgb(42, 165, 63)'},
      {'id': 'body', 'trackX': 32, 'trackY': 38, 'color': 'rgb(192, 81, 81)'}
    ];
    this.track = [];
    for (var t = 0; t < 40; t++) {
      this.track[t] = {'x': -16, 'y': 0, 'direction': 0};
    }
    this.bodyEntities = [];
    this.headEntity = null;
    this.headX = -16;
    this.headDirectionX = 2;
    this.headY = 150;
    this.headDirectionY = 0;
    this.wave = [0, 2, 4, 5, 6, 7, 7, 7, 6, 5, 4, 2, 0, -2, -4, -5, -6, -7, -7, -7, -6, -5, -4, -2];
    this.waveCounter = 0;
    this.willyEntity = null;
    this.selectedItem = 0;
    this.bkEntity = null;
    this.menuEntities = [];
    this.menuItemColor = 'rgb(108, 108, 108)';
    this.menuSelectedItemColor = 'rgb(240,240,240)';
    this.menuItems = [
      ['START GAME', ''],
      ['PLAYER NAME', 'libmit'],
      ['HALL OF FAME', ''],
      ['SOUND', 'OFF'],
      ['MUSIC', 'OFF'],
      ['CONTROLS', ''],
      ['SHOW TAPE LOADING', ''],
      ['ABOUT GAME', '']
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
      this.bodyEntities[o] = new SpriteEntity(this.desktopEntity, this.track[o]['x'], this.track[o]['y'], object['color'], false, 0, this.track[o]['direction']);
      this.desktopEntity.addEntity(this.bodyEntities[o]);
    });

    this.headEntity = new SpriteEntity(this.desktopEntity, this.headX, this.headY, 'rgb(21, 147, 181)', false, 0, 0);
    this.desktopEntity.addEntity(this.headEntity);
    this.willyEntity = new SpriteEntity(this.desktopEntity, this.headX-4, this.headY-11, this.bwColor, false, 0, 0);
    this.desktopEntity.addEntity(this.willyEntity);
    this.bkEntity = new AbstractEntity(this.desktopEntity, 13, 22, 230, 140, false, 'rgba(223, 218, 208, 0.8)');
    this.desktopEntity.addEntity(this.bkEntity);

    for (var y = 0; y < this.menuItems.length; y++) {
      var bkColor = false;
      var penColor = this.menuItemColor;
      if (y == this.selectedItem) {
        bkColor = this.menuItemColor
        penColor = this.menuSelectedItemColor;
      }
      this.menuEntities[y] = [];
      this.menuEntities[y][1] = new ZXTextEntity(this.desktopEntity, 133, 30+y*16, 100, 12, this.menuItems[y][1], penColor, bkColor, 0, true);
      this.menuEntities[y][1].margin = 2;
      this.menuEntities[y][1].justify = 1;
      this.desktopEntity.addEntity(this.menuEntities[y][1]);
      this.menuEntities[y][0] = new ZXTextEntity(this.desktopEntity, 23, 30+y*16, 138, 12, this.menuItems[y][0], penColor, bkColor, 0, true);
      this.menuEntities[y][0].margin = 2;
      this.desktopEntity.addEntity(this.menuEntities[y][0]);
    }

    this.logoEntity = new LogoEntity(this.desktopEntity, 144, 6, 93, 10, 0);
    this.desktopEntity.addEntity(this.logoEntity);

    this.copyrightEntity = new ZXTextEntity(this.desktopEntity, 0, 23*8, 32*8, 8, '© 2025 GNU General Public Licence', this.app.platform.colorByName('black'), false, 0, true);
    this.copyrightEntity.justify = 2;
    this.desktopEntity.addEntity(this.copyrightEntity);

    this.floorEntity = new AbstractEntity(this.desktopEntity, 12, 176, 230, 2, false, false);
    this.desktopEntity.addEntity(this.floorEntity);

    this.sendEvent(330, {'id': 'changeFlashState'});
  } // init

  setData(data) {
    this.bodyEntities.forEach((entity, e) => {
      entity.setGraphicsData(data['body']);
    });

    this.headEntity.setGraphicsData(data['head']);
    this.willyEntity.setGraphicsData(data['willy']);
    this.redraw = true;
    super.setData(data);
  } // setData

  changeMenuItem(newItem) {
    if (newItem < 0 || newItem >= this.menuItems.length) {
      return;
    }
    this.menuEntities[this.selectedItem][0].bkColor = false;
    this.menuEntities[this.selectedItem][1].bkColor = false;
    this.menuEntities[this.selectedItem][0].penColor = this.menuItemColor;
    this.menuEntities[this.selectedItem][1].penColor = this.menuItemColor;
    this.selectedItem = newItem;
    this.menuEntities[this.selectedItem][0].bkColor = this.menuItemColor;
    this.menuEntities[this.selectedItem][1].bkColor = this.menuItemColor;
    this.menuEntities[this.selectedItem][0].penColor = this.menuSelectedItemColor;
    this.menuEntities[this.selectedItem][1].penColor = this.menuSelectedItemColor;
    this.redraw = true;
} // changeMenuItem

  handleEvent(event) {
    var result = super.handleEvent(event);
    if (result == true) {
      return true;
    }

    switch (event['id']) {

      case 'changeFlashState':
        this.flashState = !this.flashState;
        this.logoEntity.flashState = this.flashState;
        this.redraw = true;
        this.sendEvent(330, {'id': 'changeFlashState'});
        return true;

      case 'keyPress':
        switch (event['key']) {
          case 'ArrowDown':
            this.changeMenuItem(this.selectedItem+1);
            return true;
          case 'ArrowUp':
            this.changeMenuItem(this.selectedItem-1);
            return true;
          }
        break;

      case 'mouseClick':
        for (var i = 0; i < this.menuItems.length; i++) {
          if ((this.menuEntities[i][0].parentX+this.menuEntities[i][0].x)*this.app.layout.ratio <= event['x'] &&
            (this.menuEntities[i][0].parentY+this.menuEntities[i][0].y)*this.app.layout.ratio <= event['y'] &&
            (this.menuEntities[i][1].parentX+this.menuEntities[i][1].x+this.menuEntities[i][1].width)*this.app.layout.ratio >= event['x'] &&
            (this.menuEntities[i][1].parentY+this.menuEntities[i][1].y+this.menuEntities[i][1].height)*this.app.layout.ratio >= event['y']
          ) {
            this.changeMenuItem(i);
            return true;
          }
        }        
        break;

      case 'updateScene':

        this.gameFrame = this.app.rotateInc(this.gameFrame, 0, 14);

        // head
        if (this.gameFrame%2 == 0) {
          this.headEntity.incFrame();
          this.redraw = true;
        }
        this.headX += this.headDirectionX;
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
            (this.headDirectionX < 0 && this.headX < 4)) {
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
        this.willyEntity.y = this.headEntity.y-11;
        this.willyEntity.direction = this.headEntity.direction;
        if (this.gameFrame == 1 || this.gameFrame == 4) {
          this.willyEntity.incFrame();
        }

        // body
        this.bodyEntities.forEach((entity, e) => {
          entity.x = this.track[this.bodyObjects[e]['trackX']]['x'];
          entity.y = this.track[this.bodyObjects[e]['trackY']]['y'];
          entity.direction = this.track[this.bodyObjects[e]['trackX']]['direction'];
          if (this.gameFrame%4 == 0) {
            entity.incFrame();
          }
        });
        this.track.shift();
        this.track.push({'x': this.headEntity.x, 'y': this.headEntity.y, 'direction': this.headEntity.direction});
        this.redraw = true;

        return true;

      case 'setMenuData':
        this.setData(event['data']);
        return true;
    }
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);

    if (this.redraw == true) {
      this.redraw = false;
      this.drawModel();
    }
  }

} // class MenuModel

export default MenuModel;
