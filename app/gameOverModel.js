/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { GameInfoEntity } = await import('./gameInfoEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
const { PillarEntity } = await import('./pillarEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { ButtonEntity } = await import('./svision/js/platform/canvas2D/buttonEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import GameInfoEntity from './gameInfoEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
import PillarEntity from './pillarEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
import ButtonEntity from './svision/js/platform/canvas2D/buttonEntity.js';
/**/
// begin code

export class GameOverModel extends AbstractModel {
  
  constructor(app, shoeAnimation, nextModel) {
    super(app);
    this.id = 'GameOverModel';

    this.shoeAnimation = shoeAnimation;
    this.nextModel = nextModel;
    this.gameInfoEntity = null;
    this.pillarEntity = null;
    this.footEntity = null;
    this.gameEntity = null;
    this.overEntity = null;
    this.contiueEntity = null;
    this.buttonYesEntity = null;
    this.buttonNoEntity = null;
    this.timerEntity = null;
    this.colorCounter = 65;
    this.colorTimer = false;
    this.fallTimer = 0;
  } // constructor

  init() {
    super.init();

    this.desktopEntity.bkColor = this.app.platform.colorByName('black'); 
    this.borderEntity.bkColor = this.app.platform.colorByName('black');
    this.gameInfoEntity = new GameInfoEntity(this.desktopEntity, 0, 16*8, 32*8, 8*8);
    this.desktopEntity.addEntity(this.gameInfoEntity);
    this.gameInfoEntity.roomNameEntity.setText(this.app.roomName);

    if (this.shoeAnimation) {
      var barrelEntity = new SpriteEntity(this.desktopEntity, 15*8, 14*8, this.app.platform.penColorByAttr(this.app.hexToInt(this.app.globalData.gameOver.barrel.attribute)), false, 0, 0);
      this.desktopEntity.addEntity(barrelEntity);
      barrelEntity.setGraphicsData(this.app.globalData.gameOver.barrel);
      var willyEntity = new SpriteEntity(this.desktopEntity, 15*8+3, 12*8, this.app.platform.penColorByAttr(this.app.hexToInt(this.app.globalData.gameOver.willy.attribute)), false, 0, 0);
      this.desktopEntity.addEntity(willyEntity);
      willyEntity.setGraphicsData(this.app.globalData.gameOver.willy);
      this.footEntity = new AbstractEntity(this.desktopEntity, 15*8, 0, 16, 16, false, this.desktopEntity.bkColor);
      this.desktopEntity.addEntity(this.footEntity);
      var footSpriteEntity = new SpriteEntity(this.footEntity, 0, 0, this.app.platform.penColorByAttr(this.app.hexToInt(this.app.globalData.gameOver.foot.attribute)), false, 0, 0);
      this.footEntity.addEntity(footSpriteEntity);
      footSpriteEntity.setGraphicsData(this.app.globalData.gameOver.foot);
      this.pillarEntity = new PillarEntity(this.desktopEntity, 15*8, 0, 16, 0, this.app.platform.penColorByAttr(this.app.hexToInt(this.app.globalData.gameOver.pillar.attribute)), this.app.globalData.gameOver.pillar);
      this.desktopEntity.addEntity(this.pillarEntity);
    }

    var colorsMap = {};
    for (var ch = 0; ch < 4; ch++) {
      colorsMap[ch] = this.app.platform.penColorByAttr(this.colorCounter);
      this.colorCounter = this.app.rotateInc(this.colorCounter, 65, 71);
    }
    this.gameEntity = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 10*8, 6*8, 4*8, 8, 'Game', this.app.platform.colorByName('brightWhite'), false, {penColorsMap: colorsMap, hide: true});
    this.desktopEntity.addEntity(this.gameEntity);
    colorsMap = {};
    for (var ch = 0; ch < 4; ch++) {
      colorsMap[ch] = this.app.platform.penColorByAttr(this.colorCounter);
      this.colorCounter = this.app.rotateInc(this.colorCounter, 65, 71);
    }
    this.overEntity = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 18*8, 6*8, 4*8, 8, 'Over', this.app.platform.colorByName('brightWhite'), false, {penColorsMap: colorsMap, hide: true});
    this.desktopEntity.addEntity(this.overEntity);
    this.contiueEntity = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 0, 21*8, 32*8, 8, 'Continue in the last room?', this.app.platform.colorByName('brightWhite'), false, {align: 'center', hide: true});
    this.desktopEntity.addEntity(this.contiueEntity);
    this.buttonYesEntity = new ButtonEntity(this.desktopEntity, this.app.fonts.zxFonts8x8Mono, 42, 23*8-4, 70, 12, 'YES', 'restartRoom', ['Enter'], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightGreen'), {topMargin: 2, align: 'center', hide: true});
    this.desktopEntity.addEntity(this.buttonYesEntity);
    this.buttonNoEntity = new ButtonEntity(this.desktopEntity, this.app.fonts.zxFonts8x8Mono, 256-(42+70), 23*8-4, 70, 12, 'NO', this.nextModel, ['Escape'], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightRed'), {topMargin: 2, align: 'center', hide: true});
    this.desktopEntity.addEntity(this.buttonNoEntity);
    this.timerEntity = new TextEntity(this.buttonNoEntity, this.app.fonts.fonts5x5, 8, 4, 10, 5, '10', this.app.platform.colorByName('white'), false, {align: 'center'});
    this.buttonNoEntity.addEntity(this.timerEntity);

    this.app.audioManager.stopAllChannels();

    if (this.shoeAnimation) {
      this.sendEvent(0, {id: 'playSound', channel: 'sounds', sound: 'gameOverSound', options: false});
    }

    var score = Object.keys(this.app.itemsCollected).length;
    if (score) {
      this.fetchData('saveGame.db', false, {name: this.app.playerName, score: score});
    }
  } // init

  setData(data) {
  } // setData

  errorData(data) {
  } // errorData

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'restartRoom':
        this.app.startRoom(false, true, false);
        return true;
      case 'MainModel':
        this.app.setModel('MainModel');
        return true;
      case 'MenuModel':
        this.app.setModel('MenuModel');
        return true;
    }
     false;
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);

    if (this.timer === false) {
      if (this.shoeAnimation) {
        this.timer = timestamp;
      } else {
        this.timer = timestamp-2000;
      }
    }
    this.fallTimer = timestamp-this.timer;
    if (this.fallTimer > 2000) {
      this.fallTimer = 2000;
      this.gameEntity.hide = false;
      this.overEntity.hide = false;
      var countdownLength = 2;
      if (this.app.roomNumber != this.app.globalData.initRoom) {
        this.contiueEntity.hide = false;
        this.buttonYesEntity.hide = false;
        this.buttonNoEntity.hide = false;
        countdownLength = 10;
      }
      if (this.colorTimer === false) {
        this.colorTimer = timestamp;
      }
      if (timestamp-this.colorTimer > 50) {
        this.colorTimer = timestamp;
        for (var ch = 0; ch < 4; ch++) {
          this.gameEntity.options.penColorsMap[ch] = this.app.platform.penColorByAttr(this.colorCounter);
          this.colorCounter = this.app.rotateInc(this.colorCounter, 65, 71);
        }
        this.gameEntity.drawingCache[0].cleanCache();
        for (var ch = 0; ch < 4; ch++) {
          this.overEntity.options.penColorsMap[ch] = this.app.platform.penColorByAttr(this.colorCounter);
          this.colorCounter = this.app.rotateInc(this.colorCounter, 65, 71);
        }
        this.overEntity.drawingCache[0].cleanCache();
      }
      var countdown = countdownLength-Math.floor((timestamp-this.timer-2000)/1000);
      if (countdown < 0) {
        this.sendEvent(1, {id: this.nextModel});
      } else {
        this.timerEntity.setText(countdown.toString());
      }
    }

    this.desktopEntity.bkColor = this.app.platform.color((Math.floor((this.fallTimer%200)/50)));
    if (this.shoeAnimation) {
      this.footEntity.bkColor = this.desktopEntity.bkColor;
      this.footEntity.y = Math.round(12*8*this.fallTimer/2000);
      this.pillarEntity.height = this.footEntity.y;
    }

    this.drawModel();
  } // loopModel

} // GameOverModel

export default GameOverModel;
