/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
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

    this.gameFrame = 0;
    this.dataLoaded = false;

    this.bkEntity = null;
    this.selection = 0;
    this.hoverColor = 'rgba(0, 0, 0, 0.1)';
    this.selectionHoverColor = 'rgba(0, 0, 0, 0.40)';
    this.selectionEntity = null;
    this.itemPenColor = 'rgb(127, 127, 127)';
    this.selectionItemPenColor = 'rgba(255, 255, 255, 1)';
    this.menuEntities = [];
    this.menuItems = [
      {label: 'START GAME', event: 'startGame'},
      {label: 'PLAYER NAME', event: 'setPlayerName'},
      {label: 'HALL OF FAME', event: 'showHallOfFame'},
      {label: 'SOUNDS', event: 'setSounds'},
      {label: 'MUSIC', event: 'setMusic'},
      {label: 'CONTROLS', event: 'setControls'},
      {label: 'SHOW TAPE LOADING', event: 'startTapeLoading'},
      {label: 'ABOUT GAME', event: 'showAbout'}
    ];

    this.prevCounter = 0;
    this.bodyObjects = [
      {id: 'body', trackX: 0, trackY: 26, color: 'rgb(217, 41, 188)'},
      {id: 'body', trackX: 8, trackY: 29, color: 'rgb(230, 241, 13)'},
      {id: 'body', trackX: 16, trackY: 32, color: 'rgb(90, 72, 209)'},
      {id: 'body', trackX: 24, trackY: 35, color: 'rgb(42, 165, 63)'},
      {id: 'body', trackX: 32, trackY: 38, color: 'rgb(192, 81, 81)'}
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
    this.sighboardEntity = null;
    this.copyrightEntity = null;
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

    this.selectionEntity = new AbstractEntity(this.bkEntity, 10, 10+this.selection*16, 210, 12, false, 'rgba(0, 0, 0, 0.35)');
    this.bkEntity.addEntity(this.selectionEntity);

    for (var y = 0; y < this.menuItems.length; y++) {
      var penColor = this.itemPenColor;
      if (y == this.selection) {
        penColor = this.selectionItemPenColor;
      }
      this.menuEntities[y] = [];
      this.menuEntities[y][0] = new TextEntity(this.bkEntity, this.app.fonts.zxFonts8x8, 10, 10+y*16, 210, 12, this.menuItems[y].label, penColor, false, {margin: 2});
      if (y != this.selection) {
        this.menuEntities[y][0].hoverColor = this.hoverColor;
      } else {
        this.menuEntities[y][0].hoverColor = this.selectionHoverColor;
      }
      this.bkEntity.addEntity(this.menuEntities[y][0]);
      this.menuEntities[y][1] = new TextEntity(this.bkEntity, this.app.fonts.zxFonts8x8, 120, 10+y*16, 100, 12, this.menuParamValue(this.menuItems[y].event), penColor, false, {margin: 2, align: 'right'});
      this.bkEntity.addEntity(this.menuEntities[y][1]);
    }

    var signboardFonts = new SignboardFonts(this.app);
    this.sighboardEntity = new TextEntity(this.desktopEntity, signboardFonts, 144, 6, 93, 10, 'JET SET WILlY', 'rgb(91, 91, 91)', false, {scale: 2, animationMode: 'flashPenColor', flashColor: 'rgb(155, 155, 155)'});
    this.desktopEntity.addEntity(this.sighboardEntity);

    this.copyrightEntity = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 0, 23*8, 32*8, 8, '© 2025 GNU General Public Licence', this.app.platform.colorByName('black'), false, {align: 'center'});
    this.desktopEntity.addEntity(this.copyrightEntity);

    this.app.stack.flashState = false;
    this.sendEvent(330, {id: 'changeFlashState'});

    this.fetchData('menu.data', {key: 'menu', when: 'required'}, {});
    
    this.app.audioManager.closeAllChannels();
  } // init

  menuParamValue(event) {
    switch (event) {
      case 'setPlayerName':
        return this.app.playerName;
      case 'setSounds':
        switch (this.app.audioManager.volume.sounds) {
          case 0:
            return 'OFF';
          case 10:
            return 'MAX';
        }
        return (this.app.audioManager.volume.sounds*10)+'%';
      case 'setMusic':
        switch (this.app.audioManager.volume.music) {
          case 0:
            return 'OFF';
          case 10:
            return 'MAX';
        }
        return (this.app.audioManager.volume.music*10)+'%';
    }
    return '';
  } // menuParamValue

  refreshMenu() {
    for (var y = 0; y < this.menuItems.length; y++) {
      this.menuEntities[y][0].setText(this.menuItems[y].label);
      this.menuEntities[y][1].setText(this.menuParamValue(this.menuItems[y].event));
    }
  } // refreshMenu

  changeMenuItem(newSelection) {
    if (newSelection < 0 || newSelection >= this.menuItems.length) {
      return;
    }
    this.menuEntities[this.selection][0].hoverColor = this.hoverColor;
    this.menuEntities[this.selection][0].setPenColor(this.itemPenColor);
    this.menuEntities[this.selection][1].setPenColor(this.itemPenColor);
    this.selection = newSelection;
    this.menuEntities[this.selection][0].hoverColor = this.selectionHoverColor;
    this.menuEntities[this.selection][0].setPenColor(this.selectionItemPenColor);
    this.menuEntities[this.selection][1].setPenColor(this.selectionItemPenColor);
    this.selectionEntity.y = 10+this.selection*16;
  } // changeMenuItem

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

      case 'refreshMenu': 
        this.refreshMenu();
        return true;
      

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

      case 'keyPress':
        switch (event.key) {
          case 'Enter':
          case ' ':
              this.sendEvent(0, {id: this.menuItems[this.selection].event});
            return true;
          case 'ArrowDown':
            this.changeMenuItem(this.selection+1);
            return true;
          case 'ArrowUp':
            this.changeMenuItem(this.selection-1);
            return true;
          case 'Mouse1':
            for (var i = 0; i < this.menuItems.length; i++) {
              if ((this.menuEntities[i][0].pointOnEntity(event)) || (this.menuEntities[i][1].pointOnEntity(event))) {
                this.app.inputEventsManager.keysMap.Mouse1 = this.menuEntities[i][0];
                return true;
              }
            }
        }
        break;

      case 'keyRelease':
        switch (event.key) {
          case 'Mouse1':
            for (var i = 0; i < this.menuItems.length; i++) {
              if ((this.menuEntities[i][0].pointOnEntity(event)) || (this.menuEntities[i][1].pointOnEntity(event))) {
                if (this.app.inputEventsManager.keysMap.Mouse1 === this.menuEntities[i][0]) {
                  this.changeMenuItem(i);
                  this.sendEvent(0, {id: this.menuItems[this.selection].event});
                  return true;
                }
              }
            }
        }
        break;
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
