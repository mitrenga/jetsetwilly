/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
const { IntroImageEntity } = await import('./introImageEntity.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
import IntroImageEntity from './introImageEntity.js';
/**/
// begin code

export class IntroModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'IntroModel';
  } // constructor

  init() {
    super.init();

    this.borderEntity.bkColor = this.app.platform.colorByName('magenta');
    this.desktopEntity.addEntity(new IntroImageEntity(this.desktopEntity, 0, 0, 32*8, 16*8));
  } // init

} // class IntroModel

export default IntroModel;
