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
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 0, 0, 59, 7, 'ABOUT GAME', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlack'), {margin: 1}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 9, this.width-4, 7, 'JET SET WILLY` IS A REMAKE OF THE ORIGINAL', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 16, this.width-4, 7, '1984 GAME BY MATTHEW SMITH.', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 28, this.width-4, 7, 'FUNNY`````` THING````` IS,`````` DURING````` DEVELOPMENT,', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 35, this.width-4, 7, 'I``` STUDIED```` THE``` ORIGINAL```` CODE``` AND``` CAME', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 42, this.width-4, 7, 'ACROSS```` BUGS``` THAT``` MADE``` IT``` IMPOSSIBLE', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 49, this.width-4, 7, 'TO````` COMPLETE````` THE```` GAME````` SUCCESSFULLY.', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 56, this.width-4, 7, 'WHILE` RESEARCHING` FURTHER,` I DISCOVERED', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 63, this.width-4, 7, 'THAT` THESE`` BUGS`` HAD` BEEN` DOCUMENTED', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 70, this.width-4, 7, 'IN THE` 80\'S,` AND` INSTRUCTIONS` ON` HOW` TO', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 77, this.width-4, 7, 'FIX THEM WERE PUBLISHED.', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 89, this.width-4, 7, 'AND` I ONLY` FOUND` OUT ABOUT` IT 40 YEARS', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 96, this.width-4, 7, 'LATER :-) SO MANY MONTHS` AND SLEEPLESS', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 103, this.width-4, 7, 'NIGHTS`` WERE`` SPENT`` WITH` FRIENDS`` TRYING', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 110, this.width-4, 7, 'TO` GET` THROUGH` ROOMS` LIKE` THE` BANYAN', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 2, 117, this.width-4, 7, 'TREE OR CONSERVATORY ROOF.', this.app.platform.colorByName('black'), false, {}));
    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, this.width-38, this.height-15, 36, 13, 'CLOSE', 'closeAbout', ['Enter', 'Escape', ' '], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlue'), {align: 'center', margin: 4}));
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
