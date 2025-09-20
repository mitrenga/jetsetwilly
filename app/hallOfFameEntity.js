/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { MiniTextEntity } = await import('./svision/js/platform/canvas2D/miniTextEntity.js?ver='+window.srcVersion);
const { MiniButtonEntity } = await import('./svision/js/platform/canvas2D/miniButtonEntity.js?ver='+window.srcVersion);
const { ZXTextEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js//abstractEntity.js';
import MiniTextEntity from './svision/js/platform/canvas2D/miniTextEntity.js';
import MiniButtonEntity from './svision/js/platform/canvas2D/miniButtonEntity.js';
import ZXTextEntity from './svision/js/platform/canvas2D/zxSpectrum/zxTextEntity.js';
/**/
// begin code

export class HallOfFameEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'HallOfFameEntity';    
    this.tableHallOfFame = {
      0: {name: 'bibix', score: '100%'},
      1: {name: 'Matthew Smith', score: '71%'},
      2: {name: 'bibix', score: '60%'},
      3: {name: 'Libor Mitrenga', score: '35%'},
      4: {name: 'hunter 007', score: '30%'},
      5: {name: 'narci', score: '22%'},
      6: {name: 'perpe2a', score: '21%'},
      7: {name: 'noname001', score: '15%'},
      8: {name: 'bibix', score: '10%'},
      9: {name: 'Libor Mitrenga', score: '1%'}
    };
  } // constructor

  init() {
    super.init();
    this.addEntity(new AbstractEntity(this, 1, 7, this.width-2, this.height-8, false, this.app.platform.colorByName('brightWhite')));
    this.addEntity(new AbstractEntity(this, 0, 6, this.width, 1, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new AbstractEntity(this, 0, 6, 1, this.height-6, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new AbstractEntity(this, 0, this.height-1, this.width, 1, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new AbstractEntity(this, this.width-1, 6, 1, this.height-6, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new MiniTextEntity(this, 0, 0, 64, 7, 'HALL OF FAME', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlack'), 1, 1));
    for (var i = 0; i < 10; i++) {
      var y = 12+i*10;
      var entity = new ZXTextEntity(this, 2, y, 18, 8, (i+1)+'.', this.app.platform.colorByName('black'), false, 0, 1);
      entity.justify = 1;
      this.addEntity(entity);

      entity = new ZXTextEntity(this, 22, y, 100, 8, this.tableHallOfFame[i].name, this.app.platform.colorByName('black'), false, 0, 1);
      this.addEntity(entity);

      entity = new ZXTextEntity(this, this.width-78, y, 68, 8, this.tableHallOfFame[i].score, this.app.platform.colorByName('black'), false, 0, 0);
      entity.justify = 1;
      this.addEntity(entity);
    }
    this.addEntity(new MiniButtonEntity(this, this.width-38, this.height-15, 36, 13, 'CLOSE', 'closeAbout', ['Enter', 'Escape', ' '], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlue'), 1, 4));
  } // init

  handleEvent(event) {
    switch (event.id) {
      case 'closeAbout':
        this.destroy();
        return true;
    }

    return super.handleEvent(event);
  } // handleEvent

} // class HallOfFameEntity

export default HallOfFameEntity;
