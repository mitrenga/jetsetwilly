/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { SlidingTextEntity } = await import('./svision/js/platform/canvas2D/slidingTextEntity.js?ver='+window.srcVersion);
const { ButtonEntity } = await import('./svision/js/platform/canvas2D/buttonEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js//abstractEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
import SlidingTextEntity from './svision/js/platform/canvas2D/slidingTextEntity.js';
import ButtonEntity from './svision/js/platform/canvas2D/buttonEntity.js';
/**/
// begin code

export class HallOfFameEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'HallOfFameEntity';

    this.noteEntity = null;
  } // constructor

  init() {
    super.init();
    
    this.addEntity(new AbstractEntity(this, 0, 6, this.width, this.height-6, false, this.app.platform.colorByName('black')));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 0, 0, 64, 7, 'HALL OF FAME', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('black'), {topMargin: 1, leftMargin: 2}));
    this.addEntity(new AbstractEntity(this, 1, 7, this.width-2, this.height-8, false, this.app.platform.colorByName('brightWhite')));
    this.noteEntity = new SlidingTextEntity(this, this.app.fonts.fonts5x5, 8, this.height-12, this.width-55, 5, "                                                    Only results from standard games started in the Bathroom are recorded. Continued games are not included.                                                    ", this.app.platform.colorByName('brightRed'), false, {animation: 'loopLeft'});
    this.addEntity(this.noteEntity);
    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, this.width-39, this.height-16, 36, 13, 'CLOSE', {id: 'closeHallOfFame'}, ['Enter', 'Escape', ' ', 'GamepadOK', 'GamepadExit'], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlue'), {align: 'center', margin: 4}));

    this.fetchData('hallOfFame.db', {key: 'hallOfFame', when: 'offline'}, {});
  } // init

  setData(data) {
    if (data.source == 'server') {
      this.app.saveDataToStorage('hallOfFame', data.data);
    }

    for (var i = 0; i < Object.keys(data.data).length; i++) {
      var y = 12+i*10;
      this.addEntity(new TextEntity(this, this.app.fonts.zxFonts8x8, 2, y, 18, 8, (i+1)+'.', this.app.platform.colorByName('black'), false, {align: 'right'}));
      this.addEntity(new TextEntity(this, this.app.fonts.zxFonts8x8, 24, y, 120, 8, data.data[i].name, this.app.platform.colorByName('black'), false, {}));
      this.addEntity(new TextEntity(this, this.app.fonts.zxFonts8x8Mono, this.width-71, y, 64, 8, data.data[i].score+'/'+(this.app.items.length+1), this.app.platform.colorByName('black'), false, {align: 'right'}));
    }
  } // setData

  errorData(error) {
    this.addEntity(new TextEntity(this, this.app.fonts.zxFonts8x8, 0, this.height/2-20, this.width, 32, 'ERROR: '+error.message, this.app.platform.colorByName('brightRed'), false, {align: 'center', textWrap: true}));
    super.errorData(error);
  } // errorData

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'closeHallOfFame':
        this.destroy();
        return true;
    }

    return false;
  } // handleEvent

  loopEntity(timestamp) {
    this.noteEntity.loopEntity(timestamp);
  }

} // HallOfFameEntity

export default HallOfFameEntity;
