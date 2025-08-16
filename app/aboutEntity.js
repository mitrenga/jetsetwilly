/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { MiniTextEntity } = await import('./svision/js/platform/canvas2D/miniTextEntity.js?ver='+window.srcVersion);
const { MiniButtonEntity } = await import('./svision/js/platform/canvas2D/miniButtonEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js//abstractEntity.js';
import MiniTextEntity from './svision/js/platform/canvas2D/miniTextEntity.js';
import MiniButtonEntity from './svision/js/platform/canvas2D/miniButtonEntity.js';
/**/
// begin code

export class AboutEntity extends AbstractEntity {

  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, width, height, false, false);
    this.id = 'AboutEntity';    
  } // constructor

  init() {
    super.init();
    this.addEntity(new AbstractEntity(this, 1, 7, this.width-2, this.height-8, false, this.app.platform.colorByName('brightWhite')));
    this.addEntity(new AbstractEntity(this, 0, 6, this.width, 1, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new AbstractEntity(this, 0, 6, 1, this.height-6, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new AbstractEntity(this, 0, this.height-1, this.width, 1, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new AbstractEntity(this, this.width-1, 6, 1, this.height-6, false, this.app.platform.colorByName('brightBlack')));
    this.addEntity(new MiniTextEntity(this, 0, 0, 59, 7, 'ABOUT GAME', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlack'), 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 8, this.width-2, 7, 'JET SET WILLY` IS A REMAKE OF THE ORIGINAL', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 15, this.width-2, 7, '1984 GAME BY MATTHEW SMITH.', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 27, this.width-2, 7, 'FUNNY`````` THING````` IS,`````` DURING````` DEVELOPMENT,', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 34, this.width-2, 7, 'I``` STUDIED```` THE``` ORIGINAL```` CODE``` AND``` CAME', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 41, this.width-2, 7, 'ACROSS```` BUGS``` THAT``` MADE``` IT``` IMPOSSIBLE', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 48, this.width-2, 7, 'TO````` COMPLETE````` THE```` GAME````` SUCCESSFULLY.', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 55, this.width-2, 7, 'WHILE` RESEARCHING` FURTHER,` I DISCOVERED', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 62, this.width-2, 7, 'THAT` THESE`` BUGS`` HAD` BEEN` DOCUMENTED', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 69, this.width-2, 7, 'IN THE` 80\'S,` AND` INSTRUCTIONS` ON` HOW` TO', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 76, this.width-2, 7, 'FIX THEM WERE PUBLISHED.', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 88, this.width-2, 7, 'AND` I ONLY` FOUND` OUT ABOUT` IT 40 YEARS', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 95, this.width-2, 7, 'LATER :-) SO MANY MONTHS` AND SLEEPLESS', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 102, this.width-2, 7, 'NIGHTS`` WERE`` SPENT`` WITH` FRIENDS`` TRYING', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 109, this.width-2, 7, 'TO` GET` THROUGH` ROOMS` LIKE` THE` BANYAN', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 116, this.width-2, 7, 'TREE OR CONSERVATORY ROOF.', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniButtonEntity(this, this.width-38, this.height-15, 36, 13, 'CLOSE', 'closeAbout', ['Enter', 'Escape', ' '], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightGreen'), 1, 4));
    // JET SET WILLY je remake původní hry z roku 1984 od Matthew Smith. Vtipné je, že při tvorbě této hry jsem při studiu původního kódu narazil na chyby, které neumožňovaly úspěšně dokončit hru. Při hledání informací jsem zjistil, že tyto chyby byly v 80. letech minulého století publikované včetně návodu na opravu. A já to zjistil až po 40 letech :-) Kolik měsíců a bezesených nocí jsme s kamarády strávili při pokusech v místnostech "The Banyan Tree" nebo "Conservatory Roof".
  } // init

  handleEvent(event) {
    switch (event.id) {
      case 'closeAbout':
        this.destroy();
        return true;
    }

    return super.handleEvent(event);
  } // handleEvent

} // class AboutEntity

export default AboutEntity;
