/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
const { ButtonEntity } = await import('./svision/js/platform/canvas2D/buttonEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js//abstractEntity.js';
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
import ButtonEntity from './svision/js/platform/canvas2D/buttonEntity.js';
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
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 0, 0, 64, 7, 'HALL OF FAME', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlack'), {margin: 1}));
    for (var i = 0; i < 10; i++) {
      var y = 12+i*10;
      this.addEntity(new TextEntity(this, this.app.fonts.zxFonts8x8, 2, y, 18, 8, (i+1)+'.', this.app.platform.colorByName('black'), false, {justify: 'right'}));
      this.addEntity(new TextEntity(this, this.app.fonts.zxFonts8x8, 22, y, 100, 8, this.tableHallOfFame[i].name, this.app.platform.colorByName('black'), false, {}));
      this.addEntity(new TextEntity(this, this.app.fonts.zxFonts8x8Mono, this.width-78, y, 68, 8, this.tableHallOfFame[i].score, this.app.platform.colorByName('black'), false, {justify: 'right'}));
    }
    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, this.width-38, this.height-15, 36, 13, 'CLOSE', 'closeAbout', ['Enter', 'Escape', ' '], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlue'), {justify: 'center', margin: 4}));
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
