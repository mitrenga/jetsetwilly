/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { MenuEntity } = await import('./svision/js/platform/canvas2D/menuEntity.js?ver='+window.srcVersion);
const { SignboardFonts } = await import('./signboardFonts.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
const { ZXPlayerNameEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxPlayerNameEntity.js?ver='+window.srcVersion);
const { HallOfFameEntity } = await import('./hallOfFameEntity.js?ver='+window.srcVersion);
const { ZXVolumeEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxVolumeEntity.js?ver='+window.srcVersion);
const { ZXControlsEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxControlsEntity.js?ver='+window.srcVersion);
const { AboutEntity } = await import('./aboutEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
import MenuEntity from './svision/js/platform/canvas2D/menuEntity.js';
import SignboardFonts from './signboardFonts.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
import ZXPlayerNameEntity from './svision/js/platform/canvas2D/zxSpectrum/zxPlayerNameEntity.js';
import HallOfFameEntity from './hallOfFameEntity.js';
import ZXVolumeEntity from './svision/js/platform/canvas2D/zxSpectrum/zxVolumeEntity.js';
import ZXControlsEntity from './svision/js/platform/canvas2D/zxSpectrum/zxControlsEntity.js';
import AboutEntity from './aboutEntity.js';
/**/
// begin code

export class MenuModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'MenuModel';

    this.menuItems = [
      {t1: 'START GAME', event: 'startGame'},
      {t1: 'PLAYER NAME', event: 'setPlayerName'},
      {t1: 'HALL OF FAME', event: 'showHallOfFame'},
      {t1: 'SOUNDS', event: 'setSounds'},
      {t1: 'MUSIC', event: 'setMusic'},
      {t1: 'CONTROLS', event: 'setControls'},
      {t1: 'SHOW TAPE LOADING', event: 'startTapeLoading'},
      {t1: 'ABOUT GAME', event: 'showAbout'}
    ];
    this.menuOptions = {
      fonts: this.app.fonts.zxFonts8x8,
      leftMargin: 9,
      rightMargin: 9,
      topMargin: 8,
      itemHeight: 12,
      t1LeftMargin: 3,
      t1TopMargin: 2, 
      t2Width: 114,
      t2RightMargin: 3,
      t2TopMargin: 2, 
      textColor: '#7f7f7f',
      selectionTextColor: '#ffffff',
      selectionBarColor: '#00000059',
      hoverColor: '#0000001a',
      selectionHoverColor: '#00000066'
    };  

    this.sighboardEntity = null;
    this.copyrightEntity = null;

    this.prevCounter = 0;
    this.bodyObjects = [
      {id: 'body', trackX: 0, trackY: 26, color: '#d929bc'},
      {id: 'body', trackX: 8, trackY: 29, color: '#e6f10d'},
      {id: 'body', trackX: 16, trackY: 32, color: '#5a48d1'},
      {id: 'body', trackX: 24, trackY: 35, color: '#2aa53f'},
      {id: 'body', trackX: 32, trackY: 38, color: '#c05151'}
    ];
    this.bodyEntities = [];
    this.headEntity = null;
    this.headX = -16;
    this.headDirectionX = 2;
    this.headY = 150;
    this.headDirectionY = 0;
    this.track = [];
    for (var t = 0; t < 40; t++) {
      this.track[t] = {x: this.headX, y: this.headY, direction: 0};
    }
    this.wave = [0, 2, 4, 5, 6, 7, 7, 7, 6, 5, 4, 2, 0, -2, -4, -5, -6, -7, -7, -7, -6, -5, -4, -2];
    this.waveCounter = 0;
    this.willyEntity = null;
    this.gameFrame = 0;
    this.dataLoaded = false;
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('white');
    this.desktopEntity.bkColor = this.app.platform.colorByName('white');

    this.bodyObjects.forEach((object, o) => {
      this.bodyEntities[o] = new SpriteEntity(this.desktopEntity, this.headX, this.headY, object.color, false, 0, this.track[o].direction);
      this.desktopEntity.addEntity(this.bodyEntities[o]);
    });

    this.headEntity = new SpriteEntity(this.desktopEntity, this.headX, this.headY, '#1593b5', false, 0, 0);
    this.desktopEntity.addEntity(this.headEntity);
    this.willyEntity = new SpriteEntity(this.desktopEntity, this.headX-4, this.headY-11, '#7c7c7c', false, 0, 0);
    this.desktopEntity.addEntity(this.willyEntity);

    this.desktopEntity.addEntity(new MenuEntity(this.desktopEntity, 13, 22, 230, 144, '#dfdad0cc', this.menuOptions, this, this.getMenuData));

    var signboardFonts = new SignboardFonts(this.app);
    this.sighboardEntity = new TextEntity(this.desktopEntity, signboardFonts, 144, 6, 93, 10, 'JET SET WILlY', '#5b5b5bff', false, {scale: 2, animationMode: 'flashPenColor', flashColor: '#9b9b9bff'});
    this.desktopEntity.addEntity(this.sighboardEntity);

    this.copyrightEntity = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 0, 23*8, 32*8, 8, '© 2025 GNU General Public Licence', this.app.platform.colorByName('black'), false, {align: 'center'});
    this.desktopEntity.addEntity(this.copyrightEntity);

    this.app.stack.flashState = false;
    this.sendEvent(330, {id: 'changeFlashState'});

    this.fetchData('menu.data', {key: 'menu', when: 'required'}, {});
    
    this.app.audioManager.closeAllChannels();
  } // init

  getMenuData(self, key, row) {
    switch (key) {
      
      case 'numberOfItems':
        return self.menuItems.length;

      case 't2':
        switch (row) {
          case 1:
            return self.app.playerName;
          case 3:
            switch (self.app.audioManager.volume.sounds) {
              case 0:
                return 'OFF';
              case 10:
                return 'MAX';
            }
            return (self.app.audioManager.volume.sounds*10)+'%';
          case 4:
            switch (self.app.audioManager.volume.music) {
              case 0:
                return 'OFF';
              case 10:
                return 'MAX';
            }
            return (self.app.audioManager.volume.music*10)+'%';
        }
        break;

      default:
        if (key in self.menuItems[row]) {
          return self.menuItems[row][key];
        }
        break;

    }
    return '';
  } // getMenuData

  setData(data) {
    this.bodyEntities.forEach((entity, e) => {
      entity.setGraphicsData(data.data.body);
      entity.enablePaintWithVisibility();
    });

    this.headEntity.setGraphicsData(data.data.head);
    this.headEntity.enablePaintWithVisibility();
    this.willyEntity.setGraphicsData(data.data.willy);
    this.willyEntity.enablePaintWithVisibility();
    this.dataLoaded = true;
    super.setData(data.data);
  } // setData

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'startGame': 
        if (!this.app.playerName.length) {
          this.desktopEntity.addModalEntity(new ZXPlayerNameEntity(this.desktopEntity, 27, 24, 202, 134, true));
        } else {
          this.app.setModel('MainModel');
        }
        return true;

      case 'setPlayerName':
        this.desktopEntity.addModalEntity(new ZXPlayerNameEntity(this.desktopEntity, 27, 24, 202, 134, false));
      return true;
      
      case 'showHallOfFame':
        this.desktopEntity.addModalEntity(new HallOfFameEntity(this.desktopEntity, 27, 25, 202, 138));
        return true;

      case 'setSounds':
        this.desktopEntity.addModalEntity(new ZXVolumeEntity(this.desktopEntity, 27, 24, 202, 134, 'sounds', 'audioChannelSounds', 'exampleJumpSound'));
        return true;

      case 'setMusic':
        this.desktopEntity.addModalEntity(new ZXVolumeEntity(this.desktopEntity, 27, 24, 202, 134, 'music', 'audioChannelMusic', 'exampleInGameMelody'));
        return true;

      case 'setControls':
        this.desktopEntity.addModalEntity(new ZXControlsEntity(this.desktopEntity, 27, 24, 202, 134));
        return true;

      case 'startTapeLoading': 
        this.app.setModel('TapeLoadingModel');
        return true;
    
      case 'showAbout':
        this.desktopEntity.addModalEntity(new AboutEntity(this.desktopEntity, 27, 25, 202, 138));
        return true;

      case 'changeFlashState':
        this.app.stack.flashState = !this.app.stack.flashState;
        this.sendEvent(330, {id: 'changeFlashState'});
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
        var counter = Math.round((timestamp-this.timer)/77);
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
          this.track.push({x: this.headEntity.x, y: this.headEntity.y, direction: this.headEntity.direction});
        }
      }
    }
  
    this.drawModel();
  } // loopModel

} // MenuModel

export default MenuModel;
