/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { BorderEntity } = await import('./borderEntity.js?ver='+window.srcVersion);
const { MainImageEntity } = await import('./mainImageEntity.js?ver='+window.srcVersion);
const { SlidingTextEntity } = await import('./svision/js/platform/canvas2D/slidingTextEntity.js?ver='+window.srcVersion);
const { PauseGameEntity } = await import('./pauseGameEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import BorderEntity from './borderEntity.js';
import MainImageEntity from './mainImageEntity.js';
import SlidingTextEntity from './svision/js/platform/canvas2D/slidingTextEntity.js';
import PauseGameEntity from './pauseGameEntity.js';
/**/
// begin code

export class MainModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'MainModel';

    this.mainImageEntity = null;
    this.slidingText = 
      '+++++ Press ENTER to Start +++++' +
      '  ' +
      'JET-SET WILLY by Matthew Smith' +
      '  ' +
      '© 1984 SOFTWARE PROJECTS Ltd' +
      ' . . . . . . ' +
      'Guide Willy to collect all the items around the house before Midnight so Maria will let you get to your bed' +
      ' . . . . . . ';
    this.slidingTextEntity = null;
    this.screechDuration = 0;
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('black');
    this.mainImageEntity = new MainImageEntity(this.desktopEntity, 0, 0, 32*8, 24*8, this.flashState);
    this.desktopEntity.addEntity(this.mainImageEntity);
    this.slidingTextEntity = new SlidingTextEntity(this.mainImageEntity, this.app.fonts.zxFonts8x8Mono, 0, 18*8, 32*8, 1*8, this.slidingText, this.app.platform.colorByName('yellow'), this.app.platform.colorByName('black'), {animation: 'custom', rightMargin: 256});
    this.mainImageEntity.addEntity(this.slidingTextEntity);
    this.sendEvent(0, {id: 'openAudioChannel', channel: 'music', options: {muted: this.app.muted.music}});
    this.sendEvent(0, {id: 'openAudioChannel', channel: 'sounds', options: {muted: this.app.muted.sounds}});
    this.sendEvent(0, {id: 'openAudioChannel', channel: 'extra', options: {muted: this.app.muted.sounds}});
    this.sendEvent(0, {id: 'playSound', channel: 'music', sound: 'titleScreenMelody', options: false});

    this.app.stack.flashState = false;
    this.sendEvent(330, {id: 'changeFlashState'});
  } // init

  shutdown() {
    super.shutdown();
    this.app.audioManager.stopAllChannels();
  } // shutdown

  newBorderEntity() {
    return new BorderEntity(true, false);
  } // newBorderEntity

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'changeFlashState':
        this.app.stack.flashState = !this.app.stack.flashState;
        this.sendEvent(330, {id: 'changeFlashState'});
        return true;

      case 'melodyEnd':
        this.sendEvent(0, {id: 'playSound', channel: 'music', sound: 'screechSound', options: false});
        return true;

      case 'screechBegin':
        this.slidingTextEntity.setPenColor(this.app.platform.colorByName('brightWhite'));
        this.slidingTextEntity.setBkColor(this.app.platform.colorByName('brightBlue'));
        this.screechDuration = event.data.duration;
        this.timer = this.app.now;
        this.sendEvent(0, {id: 'setBorderAnimation', value: 'screech'});
        return true;

      case 'screechEnd':
        this.app.demoRooms = [];
        var rndRooms = [];
        for (var r = 0; r < this.app.globalData.roomsCount; r++) {
          if (r != this.app.globalData.initRoom && this.app.globalData.invalidRooms.indexOf(r) == -1) {
            rndRooms.push(r);
          }
        }
        while(rndRooms.length && this.app.demoRooms.length < 9) {
          var r = Math.round(Math.random()*(rndRooms.length-1));
          this.app.demoRooms.push(rndRooms[r]);
          rndRooms.splice(r, 1);
        }
        this.sendEvent(1, {id: 'newDemoRoom'});

        return true;


      case 'keyPress':
        if (this.desktopEntity.modalEntity == null) {
          var key = event.key;
          if (key.length == 1) {
            key = key.toUpperCase();
          }
          switch (key) {
            case 'Enter':
            case 'GamepadOK':
              this.app.startRoom(false, true, true);
              return true;
            case 'Escape':
            case 'GamepadExit':
              this.desktopEntity.addModalEntity(new PauseGameEntity(this.desktopEntity, 52, 40, 153, 85, 'OPTIONS', 'MenuModel'));
              return true;
            case 'Mouse1':
              this.app.inputEventsManager.keysMap.Mouse1 = this.borderEntity;
              return true;
            case 'Touch':
              this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity;
              return true;
            case this.app.controls.keyboard.music:
              this.app.muted.music = !this.app.muted.music;
              this.app.audioManager.muteChannel('music', this.app.muted.music);
              return true;
            case this.app.controls.keyboard.sounds:
              this.app.muted.sounds = !this.app.muted.sounds;
              this.app.audioManager.muteChannel('sounds', this.app.muted.sounds);
              this.app.audioManager.muteChannel('extra', this.app.muted.sounds);
              return true;
          }
        }
        break;

      case 'keyRelease':
        switch (event.key) {
          case 'Mouse1':
            if (this.app.inputEventsManager.keysMap.Mouse1 === this.borderEntity) {
              this.app.startRoom(false, true, true);
              return true;
            }
            break;
          case 'Touch':
            if (this.app.inputEventsManager.touchesMap[event.identifier] === this.borderEntity) {
              this.app.startRoom(false, true, true);
              return true;
            }
            break;
        }        
        break;

      case 'newDemoRoom':
        this.app.startRoom(true, true, true);
        return true;

      case 'errorAudioChannel':
        this.app.showErrorMessage(event.error, 'reopen');
        return true;
    }
    
    return false;
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);

    if (this.timer != false) {
      if (timestamp-this.timer < this.screechDuration) {
        this.slidingTextEntity.animationPosition = Math.round((this.slidingTextEntity.animationWidth-this.slidingTextEntity.width)*(timestamp-this.timer)/this.screechDuration);
        this.mainImageEntity.attrStep = Math.floor(((timestamp-this.timer)/77)%8)*3;
      }
    }

    this.drawModel();
  } // loopModel

} // MainModel

export default MainModel;
