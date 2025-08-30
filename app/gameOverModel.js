/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { GameInfoEntity } = await import('./gameInfoEntity.js?ver='+window.srcVersion);
const { SpriteEntity } = await import('./svision/js/platform/canvas2D/spriteEntity.js?ver='+window.srcVersion);
const { PillarEntity } = await import('./pillarEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import AbstractEntity from './svision/js/abstractEntity.js';
import GameInfoEntity from './gameInfoEntity.js';
import SpriteEntity from './svision/js/platform/canvas2D/spriteEntity.js';
import PillarEntity from './pillarEntity.js';
import ZXTextEntity from './svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
/**/
// begin code

export class GameOverModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'GameOverModel';

    this.gameInfoEntity = null;
    this.pillarEntity = null;
    this.footEntity = null;
    this.gameEntity = null;
    this.overEntity = null;
    this.contiueEntity = null;
    this.timerEntity = null;
    this.colorCounter = 65;
    this.colorTimer = false;
  } // constructor

  init() {
    super.init();

    this.desktopEntity.bkColor = this.app.platform.colorByName('black'); 
    this.borderEntity.bkColor = this.app.platform.colorByName('black');
    this.gameInfoEntity = new GameInfoEntity(this.desktopEntity, 0, 16*8, 32*8, 8*8);
    this.desktopEntity.addEntity(this.gameInfoEntity);
    this.gameInfoEntity.roomNameEntity.setText(this.app.roomName);

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

    this.gameEntity = new ZXTextEntity(this.desktopEntity, 10*8, 6*8, 4*8, 8, 'Game', this.app.platform.colorByName('brightWhite'), false, 0, true);
    this.gameEntity.hide = true;
    this.gameEntity.penColorsMap = {};
    for (var ch = 0; ch < 4; ch++) {
      this.gameEntity.penColorsMap[ch] = this.app.platform.penColorByAttr(this.colorCounter);
      this.colorCounter = this.app.rotateInc(this.colorCounter, 65, 71);
    }
    this.desktopEntity.addEntity(this.gameEntity);
    this.overEntity = new ZXTextEntity(this.desktopEntity, 18*8, 6*8, 4*8, 8, 'Over', this.app.platform.colorByName('brightWhite'), false, 0, true);
    this.overEntity.hide = true;
    this.overEntity.penColorsMap = {};
    for (var ch = 0; ch < 4; ch++) {
      this.overEntity.penColorsMap[ch] = this.app.platform.penColorByAttr(this.colorCounter);
      this.colorCounter = this.app.rotateInc(this.colorCounter, 65, 71);
    }
    this.desktopEntity.addEntity(this.overEntity);
    this.contiueEntity = new ZXTextEntity(this.desktopEntity, 0, 21*8, 32*8, 8, 'Press ENTER to continue', this.app.platform.colorByName('brightWhite'), false, 0, true);
    this.contiueEntity.hide = true;
    this.contiueEntity.justify = 2;
    this.desktopEntity.addEntity(this.contiueEntity);
    this.timerEntity = new ZXTextEntity(this.desktopEntity, 0, 23*8, 32*8, 8, '10', this.app.platform.colorByName('brightWhite'), false, 0, true);
    this.timerEntity.hide = true;
    this.timerEntity.justify = 2;
    this.desktopEntity.addEntity(this.timerEntity);
  } // init

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'keyPress':
        switch (event.key) {
          case 'Enter':
            this.app.model.shutdown();
            this.app.itemsCollected = 0;
            this.app.timeStr = ' 7:00am';
            this.app.demo = false;
            this.app.model = this.app.newModel('RoomModel');
            this.app.model.init();
            this.app.resizeApp();
            return true;
          case 'Escape':
            this.app.model.shutdown();
            this.app.model = this.app.newModel('MainModel');
            this.app.model.init();
            this.app.resizeApp();
            return true;
        }
        break;
      case 'MainModel':
        this.app.model.shutdown();
        this.app.model = this.app.newModel('MainModel');
        this.app.model.init();
        this.app.resizeApp();
        return true;
    }
    return false;
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);

    if (this.timer === false) {
      this.timer = timestamp;
    }
    var fallTimer = timestamp-this.timer;
    if (fallTimer > 2000) {
      fallTimer = 2000;
      this.gameEntity.hide = false;
      this.overEntity.hide = false;
      this.contiueEntity.hide = false;
      this.timerEntity.hide = false;
      if (this.colorTimer === false) {
        this.colorTimer = timestamp;
      }
      if (timestamp-this.colorTimer > 50) {
        this.colorTimer = timestamp;
        for (var ch = 0; ch < 4; ch++) {
          this.gameEntity.penColorsMap[ch] = this.app.platform.penColorByAttr(this.colorCounter);
          this.colorCounter = this.app.rotateInc(this.colorCounter, 65, 71);
        }
        this.gameEntity.drawingCache[0].cleanCache();
        for (var ch = 0; ch < 4; ch++) {
          this.overEntity.penColorsMap[ch] = this.app.platform.penColorByAttr(this.colorCounter);
          this.colorCounter = this.app.rotateInc(this.colorCounter, 65, 71);
        }
        this.overEntity.drawingCache[0].cleanCache();
      }
      var countdown = 10-Math.floor((timestamp-this.timer-2000)/1000);
      if (countdown < 0) {
        this.sendEvent(0, {'id': 'MainModel'});
      } else {
        this.timerEntity.setText(countdown.toString());
      }
    }

    this.desktopEntity.bkColor = this.app.platform.color((Math.floor((fallTimer%200)/50)));
    this.footEntity.bkColor = this.desktopEntity.bkColor;
    this.footEntity.y = Math.round(12*8*fallTimer/2000);
    this.pillarEntity.height = this.footEntity.y;

    this.drawModel();
  } // loopModel

} // class GameOverModel

export default GameOverModel;
