/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { BorderEntity } = await import('./borderEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import BorderEntity from './borderEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
/**/
// begin code

export class TapeLoadingModel extends AbstractModel {
  
  constructor(app) {
    super(app);   
    this.id = 'TapeLoadingModel';
    
    this.inputLineEntity = null;
    this.commandPhase = 0;
    this.command = ['K', 'LOAD L', 'LOAD "L', 'LOAD ""L', ''];
    this.programNameEntity = null;
    this.copyrightLine1 = null;
    this.copyrightLine2 = null;
    this.copyrightLine3 = null;
    this.copyrightLine4 = null;
    this.copyrightLine5 = null;
    this.app.stack.flashState = false;
    this.tapeBreak = false;
    this.tapePhase = false;
    this.tape = [
      {id: 'pause', duration: 1000},
      
      {id: 'pilot', duration: 3000},
      {id: 'data', duration: 100},
      {id: 'pause', duration: 800, event: {id: 'setProgramName'}},
      {id: 'pilot', duration: 1500},
      {id: 'data', duration: 1400},
      
      {id: 'pause', duration: 1000, event: {id: 'printCopyright'}},
            
      {id: 'pilot', duration: 3000},
      {id: 'data', duration: 100},
      {id: 'pause', duration: 800},
      {id: 'pilot', duration: 1500},
      {id: 'data', duration: 5000}
    ];
  } // constructor

  init() {
    super.init();

    this.inputLineEntity = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 0, 23*8, 32*8, 8, this.app.copyright, this.app.platform.colorByName('black'), false, {align: 'center'});
    this.desktopEntity.addEntity(this.inputLineEntity);

    this.programNameEntity = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 0, 1*8, 32*8, 8, 'Program: JETSET', this.app.platform.colorByName('black'), false, {leftMargin: 1});
    this.programNameEntity.hide = true;
    this.desktopEntity.addEntity(this.programNameEntity);

    this.copyrightLine1 = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 5*8, 10*8, 22*8, 8, '', this.app.platform.colorByName('white'), this.app.platform.colorByName('yellow'), {});
    this.copyrightLine1.hide = true;
    this.desktopEntity.addEntity(this.copyrightLine1);
    this.copyrightLine2 = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 5*8, 11*8, 8, 8, '', this.app.platform.colorByName('white'), this.app.platform.colorByName('yellow'), {});
    this.copyrightLine2.hide = true;
    this.desktopEntity.addEntity(this.copyrightLine2);
    this.copyrightLine3 = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8Mono, 6*8, 11*8, 20*8, 8, 'JetSet Willy Loading', this.app.platform.colorByName('white'), this.app.platform.colorByName('red'), {align: 'center', animationMode: 'flashReverseColors'});
    this.copyrightLine3.hide = true;
    this.desktopEntity.addEntity(this.copyrightLine3);
    this.copyrightLine4 = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 26*8, 11*8, 8, 8, '', this.app.platform.colorByName('white'), this.app.platform.colorByName('yellow'), {});
    this.copyrightLine4.hide = true;
    this.desktopEntity.addEntity(this.copyrightLine4);
    this.copyrightLine5 = new TextEntity(this.desktopEntity, this.app.fonts.zxFonts8x8, 5*8, 12*8, 22*8, 8, '', this.app.platform.colorByName('white'), this.app.platform.colorByName('yellow'), {});
    this.copyrightLine5.hide = true;
    this.desktopEntity.addEntity(this.copyrightLine5);

    this.sendEvent(0, {id: 'openAudioChannel', channel: 'sounds', options: {}});
    this.sendEvent(1000, {id: 'updateCommand'});

    this.app.stack.flashState = false;
    this.sendEvent(330, {id: 'changeFlashState'});
  } // init

  newBorderEntity() {
    return new BorderEntity(true, false);
  } // newBorderEntity

  shutdown() {
    this.app.audioManager.closeAllChannels();
  } // shutdown

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {

      case 'changeFlashState':
        this.app.stack.flashState = !this.app.stack.flashState;
        this.sendEvent(330, {id: 'changeFlashState'});
        return true;

      case 'updateCommand':
        this.inputLineEntity.options.align = 'left';
        this.inputLineEntity.fonts = this.app.fonts.zxFonts8x8Mono;
        this.inputLineEntity.options.animationMode = 'flashReverseColors';
        this.inputLineEntity.setText(this.command[this.commandPhase]);
        this.inputLineEntity.options.flashMask = '';
        if (this.command[this.commandPhase].length > 0) {
          this.inputLineEntity.options.flashMask = this.inputLineEntity.options.flashMask.padStart (this.command[this.commandPhase].length-1, ' ')+'#';
        }
        this.commandPhase++;
        this.sendEvent(0, {id: 'playSound', channel: 'sounds', sound: 'keyboardSound', options: false});
        if (this.commandPhase < this.command.length) {
          this.sendEvent(800, {id: 'updateCommand'});
        } else {
          this.inputLineEntity.hide = true;
          this.tapePhase = 0;
          this.sendEvent(1, {id: 'updateTape'});
        }
        return true;

      case 'updateTape':
        switch (this.tape[this.tapePhase].id) {
          case 'pilot':
            this.sendEvent(0, {id: 'playSound', channel: 'sounds', sound: 'tapePilotToneSound', options: {repeat: true}});
            this.sendEvent(0, {id: 'setBorderAnimation', value: 'pilotTone'});
            break;
          case 'data':
            this.sendEvent(0, {id: 'playSound', channel: 'sounds', sound: 'tapeRndDataSound', options: false});
            this.sendEvent(0, {id: 'setBorderAnimation', value: 'dataTone'});
            break;
          case 'pause':
            this.sendEvent(0, {id: 'stopAudioChannel', channel: 'sounds'});
            this.sendEvent(0, {id: 'setBorderAnimation', value: false});
            break;
        }
        if ('event' in this.tape[this.tapePhase]) {
          this.sendEvent(0, this.tape[this.tapePhase].event)
        }
        this.tapePhase++;
        if (this.tapePhase < this.tape.length) {
          this.sendEvent(this.tape[this.tapePhase-1].duration, {id: 'updateTape'});
        } else {
          this.sendEvent(this.tape[this.tapePhase-1].duration, {id: 'setMenuModel'});
        }
      return true;

      case 'setProgramName':
        this.programNameEntity.hide = false;
        return true;

      case 'printCopyright':
        this.programNameEntity.destroy();
        this.programNameEntity = null;
        this.sendEvent(0, {id: 'playSound', channel: 'sounds', sound: 'basicBeepsSound', options: false});
        this.copyrightLine1.hide = false;
        this.copyrightLine2.hide = false;
        this.copyrightLine3.hide = false;
        this.copyrightLine4.hide = false;
        this.copyrightLine5.hide = false;
        this.desktopEntity.bkColor = this.app.platform.colorByName('blue');
        this.borderEntity.bkColor = this.app.platform.colorByName('blue');
        return true;

      case 'setMenuModel':
        this.app.setModel('MenuModel');
        return true;
        
      case 'keyPress':
        switch (event.key) {
          case 'Escape':
          case 'GamepadExit':
            this.app.setModel('MenuModel');            
            return true;
          case ' ':
          case 'GamepadOK':
            if (this.break()) {
              return true;
            }
            break;
          case 'Mouse1':
          case 'Mouse2':
          case 'Mouse4':
            this.app.inputEventsManager.keysMap[event.key] = this.borderEntity;
            return true;
          case 'Touch':
            this.app.inputEventsManager.touchesMap[event.identifier] = this.borderEntity;
            return true;
        }
        break;

      case 'keyRelease':
        switch (event.key) {
          case 'Mouse1':
          case 'Mouse2':
          case 'Mouse4':
            if (this.app.inputEventsManager.keysMap[event.key] === this.borderEntity && this.break()) {
              return true;
            }
            return true;
          case 'Touch':
            if (this.app.inputEventsManager.touchesMap[event.identifier] === this.borderEntity && this.break()) {
              return true;
            }
            return true;
        }
        break;

      case 'errorAudioChannel':
        this.app.showErrorMessage(event.error, 'reopen');
        return true;
    }

    return false;
  } // handleEvent

  break() {
    if (this.tapeBreak) {
      this.app.setModel('MenuModel');
      return true;
    }

    if (this.tapePhase !== false) {
      if (this.tapePhase > 6 ) {
        this.app.setModel('LoadingModel');
        return true;
      }
      this.cancelEvent('updateTape');
      this.cancelEvent('setMenuModel');
      this.sendEvent(0, {id: 'stopAudioChannel', channel: 'sounds'});
      this.tapeBreak = true;
      this.inputLineEntity.setText('D BREAK - CONT repeats, 0:1');
      this.inputLineEntity.hide = false;
      this.sendEvent(0, {id: 'setBorderAnimation', value: false});
      this.sendEvent(5000, {id: 'setMenuModel'});
      return true;
    }
    return false;
  } // break

  loopModel(timestamp) {
    super.loopModel(timestamp);

    this.drawModel();
  } // loopModel

} // TapeLoadingModel

export default TapeLoadingModel;
