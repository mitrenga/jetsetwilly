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
    
    this.addEntity(new AbstractEntity(this, 0, 6, this.width, this.height-6, false, this.app.platform.colorByName('black')));
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 0, 0, 59, 7, 'ABOUT GAME', this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('black'), {topMargin: 1, leftMargin: 2}));
    this.addEntity(new AbstractEntity(this, 1, 7, this.width-2, this.height-8, false, this.app.platform.colorByName('brightWhite')));

    var aboutText = 'JET SET WILLY IS A REMAKE OF THE ORIGINAL 1984 GAME BY MATTHEW SMITH.\n' +
                    'FUNNY THING IS, DURING DEVELOPMENT, I STUDIED THE ORIGINAL CODE AND CAME ' +
                    'ACROSS BUGS THAT MADE IT IMPOSSIBLE TO COMPLETE THE GAME SUCCESSFULLY.\n' +
                    'WHILE RESEARCHING FURTHER, I DISCOVERED THAT THESE BUGS HAD BEEN DOCUMENTED ' +
                    'IN THE 80\'S, AND INSTRUCTIONS ON HOW TO FIX THEM WERE PUBLISHED.\n' +
                    'AND I ONLY FOUND OUT ABOUT IT 40 YEARS LATER :-) SO MANY MONTHS AND ' +
                    'SLEEPLESS NIGHTS WERE SPENT WITH FRIENDS TRYING TO GET THROUGH ' +
                    'ROOMS LIKE THE BANYAN TREE OR CONSERVATORY ROOF.';
    this.addEntity(new TextEntity(this, this.app.fonts.fonts5x5, 1, 7, this.width-2, 120, aboutText, this.app.platform.colorByName('black'), false, {align: 'justify', textWrap: true, margin: 2}));
    
    this.addEntity(new ButtonEntity(this, this.app.fonts.fonts5x5, this.width-39, this.height-16, 36, 13, 'CLOSE', 'closeAbout', ['Enter', 'Escape', ' '], this.app.platform.colorByName('brightWhite'), this.app.platform.colorByName('brightBlue'), {align: 'center', margin: 4}));
  } // init

  handleEvent(event) {
    switch (event.id) {
      case 'closeAbout':
        this.destroy();
        return true;
    }

    return super.handleEvent(event);
  } // handleEvent

} // AboutEntity

export default AboutEntity;
