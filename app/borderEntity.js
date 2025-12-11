/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
const { ButtonEntity } = await import('./svision/js/platform/canvas2D/buttonEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
import ButtonEntity from './svision/js/platform/canvas2D/buttonEntity.js';
/**/
// begin code

export class BorderEntity  extends AbstractEntity {

  constructor(enableExit, enableGameControls) {
    super();
    this.id = 'BorderEntity';

    this.enableExit = enableExit;
    this.enableGameControls = enableGameControls;

    this.diff = 0;
    this.animation = false;
    this.stripes = [];
    this.style = {
      pilotTone: {colors: ['cyan', 'red'], stripeHeight: 10},
      dataTone: {colors: ['blue', 'yellow'], stripeHeight: 3},
      screech: {colors: ['white', 'yellow', 'cyan', 'green', 'magenta', 'red', 'blue', 'black'], stripeHeight: 1}
    };

    this.escapeEntity = null;
    this.scale = 2;

    this.leftControlEntity = null;
    this.rightControlEntity = null;
    this.jumpControlEntity = null;
  } // constructor

  init() {
    super.init();

    if (this.enableExit) {
      if (this.app.layout.ratio > 2) {
        this.scale = 1;
      }
      this.escapeEntity = new ButtonEntity(this, this.app.fonts.zxFonts8x8Mono, 0, 0, this.scale*8, this.scale*8, 'X', {id: 'keyPress', key: 'Escape'}, [], false, false, {scale: this.scale, clickColor: '#7a7a7aff'});
      this.addEntity(this.escapeEntity);
    }

    if (this.enableGameControls) {
      this.leftControlEntity = new AbstractEntity(this, 0, 0, 0, 0, false, '#00000020');
      this.addEntity(this.leftControlEntity);
      this.rightControlEntity = new AbstractEntity(this, 0, 0, 0, 0, false, '#00000020');
      this.addEntity(this.rightControlEntity);
      this.jumpControlEntity = new AbstractEntity(this, 0, 0, 0, 0, false, '#00000020');
      this.addEntity(this.jumpControlEntity);
    }
  } // init

  drawEntity() {
    super.drawEntity();

    var penColor = this.app.platform.colorByName('brightWhite');
    if (this.animation !== false) {
      penColor = this.app.platform.colorByName('black');
    }
    switch (this.bkColor) {
      case this.app.platform.colorByName('white'):
      case this.app.platform.colorByName('yellow'):
      case this.app.platform.colorByName('cyan'):
        penColor = this.app.platform.colorByName('black');
        break;
    }
    if (this.escapeEntity.penColor !== penColor) {
      this.escapeEntity.setPenColor(penColor);
    }

    if (this.animation === false) {
      this.drawSubEntities();
      return;
    }

    var y = 0;
    var color = 0;
    if (this.animation == 'screech') {
      color = Math.floor(Math.random()*this.style[this.animation].colors.length);
    } else {
      color = Math.floor(this.diff/10);
    }
    if (this.stripes.length == 0) {
      while (y < this.height) {
        var stripeHeight = this.style[this.animation].stripeHeight;
        if ((y == 0) && (this.animation == 'pilotTone')) {
          stripeHeight = 10-this.diff%10;
        }
        var extraStripe = 0;
        if (this.animation == 'dataTone') {
          extraStripe = Math.round(Math.random()*stripeHeight);
        }
        if (this.animation == 'screech') {
          if (this.style[this.animation].colors[color] != 'black') {
            extraStripe = Math.round(Math.random()*6);
          }
        }
        if (y+stripeHeight+extraStripe > this.height) {
          stripeHeight = this.height-y-extraStripe;
        }
        this.stripes.push({y: y, height: stripeHeight+extraStripe, color: this.app.platform.colorByName(this.style[this.animation].colors[color])});
        y += stripeHeight+extraStripe;
        if (this.animation == 'screech') {
          color = Math.floor(Math.random()*this.style[this.animation].colors.length);
        } else {
          color = this.app.rotateInc(color, 0, this.style[this.animation].colors.length-1);
        }
      }
    }
    for (var s = 0; s < this.stripes.length; s++) {
      this.app.layout.paintRect(this.app.stack.ctx, 0, this.stripes[s].y, this.width, this.stripes[s].height, this.stripes[s].color);
    }
    this.drawSubEntities();
  } // drawEntity

  handleEvent(event) {
    if (super.handleEvent(event)) {
      return true;
    }

    switch (event.id) {
      case 'setBorderAnimation':
        this.animation = event.value;
        if (this.animation === 'pilotTone' || this.animation === 'screech') {
          this.sendEvent(0, 50, {id: 'moveStripes'});
        }
        return true;
      case 'moveStripes':
        this.stripes = [];
        if (this.animation !== false) {
          if (this.animation == 'screech') {
            this.diff = Math.floor(Math.random()*this.style[this.animation].colors.length*10);
          } else {
            this.diff = this.app.rotateInc(this.diff, 0, this.style[this.animation].colors.length*10-1);
          }
          this.sendEvent(0, 50, {id: 'moveStripes'});
        }
        return true;
      case 'resizeModel':
        this.escapeEntity.x = this.model.borderWidth+this.model.desktopEntity.width-this.scale*8;
        this.escapeEntity.y = this.model.borderHeight-this.scale*8;
        
        
        if (this.enableGameControls) {
          var width = Math.round(180/this.app.layout.ratio);
          var height = Math.round(180/this.app.layout.ratio);

          this.leftControlEntity.width = width;
          this.leftControlEntity.height = height;
          this.leftControlEntity.x = this.width-2*this.leftControlEntity.width-2;
          this.leftControlEntity.y = this.height-this.leftControlEntity.height;

          this.rightControlEntity.width = width;
          this.rightControlEntity.height = height;
          this.rightControlEntity.x = this.width-this.leftControlEntity.width;
          this.rightControlEntity.y = this.height-this.leftControlEntity.height;

          this.jumpControlEntity.width = width;
          this.jumpControlEntity.height = height;
          this.jumpControlEntity.x = 0;
          this.jumpControlEntity.y = this.height-this.leftControlEntity.height;
        }
        break;
    }

    return false;
  } // handleEvent

} // BorderEntity

export default BorderEntity;
