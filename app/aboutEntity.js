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
    this.addEntity(new MiniTextEntity(this, 1, 8, this.width-2, 7, 'JET SET WILLY` IS A REMAKE` OF THE ORIGINAL', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 15, this.width-2, 7, '1984`` GAME` BY`` MATTHEW` SMITH.`` THE` FUNNY', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 22, this.width-2, 7, 'THING`` IS` THAT` WHILE` CREATING`` THIS` GAME,', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 29, this.width-2, 7, 'WHILE```` STUDYING```` THE``` ORIGINAL```` CODE``` FOR', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 36, this.width-2, 7, 'THE SINCLAIR` ZX` SPECTRUM,` I CAME` ACROSS', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 43, this.width-2, 7, 'ERRORS`````` THAT`````` DID`````` NOT`````` ALLOW`````` ME`````` TO', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 50, this.width-2, 7, 'SUCCESSFULLY COMPLETE THE GAME.', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 57, this.width-2, 7, 'WHILE SEARCHING` FOR INFORMATION,` I FOUND', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 64, this.width-2, 7, 'OUT` THAT`` THESE` ERRORS` WERE` PUBLISHED', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 71, this.width-2, 7, 'IN`` THE`` 80\'S,``` INCLUDING``` INSTRUCTIONS`` FOR', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 78, this.width-2, 7, 'FIXING THEM.', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 85, this.width-2, 7, 'AND I ONLY` FOUND` OUT` 40 YEARS` LATER`` :-)', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 92, this.width-2, 7, 'HOW MANY` MONTHS` AND` SLEEPLESS` NIGHTS', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 99, this.width-2, 7, 'DID MY FRIENDS AND I SPEND EXPERIMENTING', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 106, this.width-2, 7, 'IN`` THE`` ROOMS`` OF`` "THE`` BANYAN`` TREE"`` OR', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniTextEntity(this, 1, 113, this.width-2, 7, '"THE CONSERVATORY ROOF"...', this.app.platform.colorByName('black'), false, 1, 1));
    this.addEntity(new MiniButtonEntity(this, this.width-38, this.height-15, 36, 13, 'CLOSE', 'closeAbout', ['Enter', 'Escape', ' '], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightGreen'), 1, 4));
    // JET SET WILLY je remake původní hry z roku 1984 od Matthew Smith. Vtipné je, že při tvorbě této hry jsem při studiu původního kódu pro Sinclair ZX Spectrum narazil na chyby, které neumožňovaly úspěšně dokončit hru. Při hledání informací jsem zjistil, že tyto chyby byly v 80. letech minulého století publikované včetně návodu na opravu. A já to zjistil až po 40 letech :-) Kolik měsíců a bezesených nocí jsme s kamarády strávili při pokusech v místnostech "The Banyan Tree" nebo "The Conservatory Roof"...
  } // init

  handleEvent(event) {
    switch (event['id']) {
      case 'closeAbout':
        this.destroy();
        return true;
    }

    return super.handleEvent(event);
  } // handleEvent

} // class AboutEntity

export default AboutEntity;
