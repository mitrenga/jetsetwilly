/**/
const { AbstractEntity } = await import('./svision/js/abstractEntity.js?ver='+window.srcVersion);
/*/
import AbstractEntity from './svision/js/abstractEntity.js';
/**/
// begin code

export class BorderEntity  extends AbstractEntity {

  constructor() {
    super();
    this.id = 'BorderEntity';

    this.diff = 0;
    this.animation = false;
    this.stripes = [];
    this.style = {
      'pilotTone': {'colors': ['cyan', 'red'], 'stripeHeight': 10},
      'dataTone': {'colors': ['blue', 'yellow'], 'stripeHeight': 3},
      'screech': {'colors': ['white', 'yellow', 'cyan', 'green', 'magenta', 'red', 'blue', 'black'], 'stripeHeight': 1}
    };

  } // constructor

  drawEntity() {
    super.drawEntity();
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
        this.stripes.push({'y': y, 'height': stripeHeight+extraStripe, 'color': this.app.platform.colorByName(this.style[this.animation].colors[color])});
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
    /*
    this.imageData = this.app.stack['ctx'].getImageData(30, 30, 50, 50);
    this.pixels = new Uint32Array(this.imageData.data.buffer);
    for (var x = 0; x < 50*50; x++) {
      this.pixels[x] = 0xff << 24 | 0x00 << 16 | 0x00 < 8 | 0xff;
    }
    this.app.stack['ctx'].putImageData(this.imageData, 30, 30);*/
    var cacheCanvas = document.createElement('canvas');
    cacheCanvas.width = 50;
    cacheCanvas.height = 50;
    var ctx = cacheCanvas.getContext('2d');
    ctx.fillStyle = 'red';
    //for (var x = 0; x < 50; x++) {
      ctx.fillRect(0, 0, 50, 50);
    //}
    this.app.stack['ctx'].drawImage(cacheCanvas, -30, 0);
  } // drawEntity

  handleEvent(event) {
    switch (event.id) {
      case 'setBorderAnimation':
        this.animation = event.value;
        if (this.animation === 'pilotTone' || this.animation === 'screech') {
          this.sendEvent(0, 50, {'id': 'moveStripes'});
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
          this.sendEvent(0, 50, {'id': 'moveStripes'});
        }
        return true;
    }

    return super.handleEvent(event);
  } // handleEvent

} // class BorderEntity

export default BorderEntity;
