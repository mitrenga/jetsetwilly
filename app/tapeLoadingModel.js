/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import ZXTextEntity from './svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
/**/
// begin code

export class TapeLoadingModel extends AbstractModel {
  
  constructor(app) {
    super(app);   
    this.id = 'TapeLoadingModel';
    
    this.inputLineEntity = null;
    this.command = ['K', 'LOAD L', 'LOAD "L', 'LOAD ""L', ''];
    this.phase = 0;
    this.programNameEntity = null;
    this.copyrightLine1 = null;
    this.copyrightLine2 = null;
    this.copyrightLine3 = null;
    this.copyrightLine4 = null;
    this.copyrightLine5 = null;
    this.app.stack['flashState'] = false;
    this.tape = [
      {'id': 'pause', 'duration': 1000},
      
      {'id': 'pilot', 'duration': 3000},
      {'id': 'data', 'duration': 100},
      {'id': 'pause', 'duration': 800, 'event': 'setProgramName'},
      {'id': 'pilot', 'duration': 1500},
      {'id': 'data', 'duration': 1400},
      
      {'id': 'pause', 'duration': 1000, 'event': 'printCopyright'},
            
      {'id': 'pilot', 'duration': 3000},
      {'id': 'data', 'duration': 100},
      {'id': 'pause', 'duration': 800},
      {'id': 'pilot', 'duration': 1500},
      {'id': 'data', 'duration': 5000}
    ];
  } // constructor

  init() {
    super.init();

    this.inputLineEntity = new ZXTextEntity(this.desktopEntity, 0, 23*8, 32*8, 8, '© 2025 GNU General Public Licence', this.app.platform.colorByName('black'), false, 0, true);
    this.inputLineEntity.justify = 2;
    this.desktopEntity.addEntity(this.inputLineEntity);

    this.programNameEntity = new ZXTextEntity(this.desktopEntity, 0, 1*8, 32*8, 8, 'Program: JETSET', this.app.platform.colorByName('black'), false, 0, true);
    this.programNameEntity.hide = true;
    this.desktopEntity.addEntity(this.programNameEntity);

    this.copyrightLine1 = new ZXTextEntity(this.desktopEntity, 5*8, 10*8, 22*8, 8, '', this.app.platform.colorByName('white'), this.app.platform.colorByName('yellow'), 0, true);
    this.copyrightLine1.hide = true;
    this.desktopEntity.addEntity(this.copyrightLine1);
    this.copyrightLine2 = new ZXTextEntity(this.desktopEntity, 5*8, 11*8, 8, 8, '', this.app.platform.colorByName('white'), this.app.platform.colorByName('yellow'), 0, true);
    this.copyrightLine2.hide = true;
    this.desktopEntity.addEntity(this.copyrightLine2);
    this.copyrightLine3 = new ZXTextEntity(this.desktopEntity, 6*8, 11*8, 20*8, 8, 'JetSet Willy Loading', this.app.platform.colorByName('white'), this.app.platform.colorByName('red'), 0, false);
    this.copyrightLine3.flashMask = '####################';
    this.copyrightLine3.justify = 2;
    this.copyrightLine3.hide = true;
    this.desktopEntity.addEntity(this.copyrightLine3);
    this.copyrightLine4 = new ZXTextEntity(this.desktopEntity, 26*8, 11*8, 8, 8, '', this.app.platform.colorByName('white'), this.app.platform.colorByName('yellow'), 0, true);
    this.copyrightLine4.hide = true;
    this.desktopEntity.addEntity(this.copyrightLine4);
    this.copyrightLine5 = new ZXTextEntity(this.desktopEntity, 5*8, 12*8, 22*8, 8, '', this.app.platform.colorByName('white'), this.app.platform.colorByName('yellow'), 0, true);
    this.copyrightLine5.hide = true;
    this.desktopEntity.addEntity(this.copyrightLine5);

    if (this.app.audioManager.sounds > 0) {
      this.sendEvent(500, {'id': 'openAudioChannel', 'channel': 'sounds'});
    }
    this.sendEvent(1000, {'id': 'updateCommand'});
    this.sendEvent(330, {'id': 'changeFlashState'});
  } // init

  handleEvent(event) {
    switch (event['id']) {

      case 'changeFlashState':
        this.app.stack['flashState'] = !this.app.stack['flashState'];
        this.sendEvent(330, {'id': 'changeFlashState'});
        return true;

      case 'updateCommand':
        this.inputLineEntity.justify = 0;
        this.inputLineEntity.proportional = false;
        this.inputLineEntity.text = this.command[this.phase];
        this.inputLineEntity.flashMask = '';
        if (this.command[this.phase].length > 0) {
          this.inputLineEntity.flashMask = this.inputLineEntity.flashMask.padStart (this.command[this.phase].length-1, ' ')+'#';
        }
        this.phase++;
        this.sendEvent(0, {'id': 'playSound', 'channel': 'sounds', 'sound': 'pressKeyboardData', 'options': false});
        if (this.phase < this.command.length) {
          this.sendEvent(800, {'id': 'updateCommand'});
        } else {
          this.inputLineEntity.destroy();
          this.inputLineEntity = null;
          this.phase = 0;
          this.sendEvent(1, {'id': 'updateTape'});
        }
        return true;

      case 'updateTape':
        switch (this.tape[this.phase]['id']) {
          case 'pilot':
            this.sendEvent(0, {'id': 'playSound', 'channel': 'sounds', 'sound': 'tapePilotTone', 'options': {'repeat': true}});
            this.sendEvent(0, {'id': 'setBorderAnimation', 'value': 'pilotTone'});
            break;
          case 'data':
            this.sendEvent(0, {'id': 'playSound', 'channel': 'sounds', 'sound': 'tapeRandomToneData', 'options': false});
            this.sendEvent(0, {'id': 'setBorderAnimation', 'value': 'dataTone'});
            break;
          case 'pause':
            this.sendEvent(0, {'id': 'stopAudioChannel', 'channel': 'sounds'});
            this.sendEvent(0, {'id': 'setBorderAnimation', 'value': false});
            break;
        }
        if ('event' in this.tape[this.phase]) {
          this.sendEvent(0, {'id': this.tape[this.phase]['event']})
        }
        this.phase++;
        if (this.phase < this.tape.length) {
          this.sendEvent(this.tape[this.phase-1]['duration'], {'id': 'updateTape'});
        } else {
          this.sendEvent(this.tape[this.phase-1]['duration'], {'id': 'setMenuModel'});
        }
      return true;

      case 'setProgramName':
        this.programNameEntity.hide = false;
        return true;

      case 'printCopyright':
        this.programNameEntity.destroy();
        this.programNameEntity = null;
        this.sendEvent(0, {'id': 'playSound', 'channel': 'sounds', 'sound': 'cycleBasicBeepsData', 'options': false});
        this.copyrightLine1.hide = false;
        this.copyrightLine2.hide = false;
        this.copyrightLine3.hide = false;
        this.copyrightLine4.hide = false;
        this.copyrightLine5.hide = false;
        this.desktopEntity.bkColor = this.app.platform.colorByName('blue');
        this.borderEntity.bkColor = this.app.platform.colorByName('white');
        return true;

      case 'setMenuModel':
        this.app.model.shutdown();
        this.app.model = this.app.newModel('MenuModel');
        this.app.model.init();
        this.app.resizeApp();
        return true;
    }

    return super.handleEvent(event);
  } // handleEvent

  loopModel(timestamp) {
    super.loopModel(timestamp);

    this.drawModel();
  } // loopModel

} // class TapeLoadingModel

export default TapeLoadingModel;
