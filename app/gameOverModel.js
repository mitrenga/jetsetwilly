/**/
const { AbstractModel } = await import('./svision/js/abstractModel.js?ver='+window.srcVersion);
/*/
import AbstractModel from './svision/js/abstractModel.js';
/**/
// begin code

class Fireworks {

  constructor(app, xStart, yStart, xTarget, yTarget, color, main) {
    this.app = app;

    this.x = xStart;
    this.y = yStart;
    this.xStart = xStart;
    this.yStart = yStart;
    this.xTarget = xTarget;
    this.yTarget = yTarget;
    this.color = color;
    this.main = main;
    this.step = 1+Math.round(Math.random()*1);
    this.controlAxis = 'x';
    if (Math.abs(xTarget-xStart) < Math.abs(yTarget-yStart)) {
      this.controlAxis = 'y';
    }
  }

  loopFireworks() {
        if (this.controlAxis == 'x') {
      if (this.x < this.xTarget) {
        this.x += (this.step < Math.abs(this.x-this.xTarget)) ? this.step : Math.abs(this.x-this.xTarget);
      }
      if (this.x > this.xTarget) {
        this.x -= (this.step < Math.abs(this.x-this.xTarget)) ? this.step : Math.abs(this.x-this.xTarget);
      }
      this.y = this.yStart+Math.round((this.yTarget-this.yStart)*(this.xStart-this.x)/(this.xStart-this.xTarget));
    } else {
      if (this.y < this.yTarget) {
        this.y += (this.step < Math.abs(this.y-this.yTarget)) ? this.step : Math.abs(this.y-this.yTarget);
      }
      if (this.y > this.yTarget) {
        this.y -= (this.step < Math.abs(this.y-this.yTarget)) ? this.step : Math.abs(this.y-this.yTarget);
      }
      this.x = this.xStart+Math.round((this.xTarget-this.xStart)*(this.yStart-this.y)/(this.yStart-this.yTarget));
    }

  } // loopFireworks

  drawFireworks(ratio) {
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, ratio/8, ratio/8);
  } // drawFireworks

} // class Fireworks


export class GameOverModel extends AbstractModel {
  
  constructor(app) {
    super(app);
    this.id = 'GameOverModel';

    this.fireworks = [];
  } // constructor
 
  init() {
    super.init();

  } // init

  loopModel() {
    super.loopModel();

    if (this.timeDiff > 1000) {
      var quantityMain = 0;
      this.fireworks.forEach((item) => {
        if (item.main == true) {
          quantityMain++;
        }
      });
      if (quantityMain < 40) {
        this.fireworks.push(
          new Fireworks(
            this.canvas.element, this.ctx, 
            Math.round(this.canvas.element.width/2), this.canvas.element.height,
            Math.round(Math.random()*this.canvas.element.width/2+this.canvas.element.width/4),
            Math.round(Math.random()*this.canvas.element.height/2),
            'rgb('+Math.floor(Math.random()*256)+','+Math.floor(Math.random()*256)+','+Math.floor(Math.random()*256)+')',
            true
          )
        );
      }
      for (var f = 0; f < this.fireworks.length; ) {
        var item = this.fireworks[f];
        if (item.x == item.xTarget && item.y == item.yTarget) {
          if (item.main == true) {
            for (var x = 0; x < 10+Math.round(Math.random()*10); x++) {
              var a = Math.random();
              var b = Math.random();
              var xCircle = 0;
              var yCircle = 0;
              if (a > 0 || b > 0) {
                if (b < a) {
                  var z = a;
                  a = b;
                  b = z;
                }
                xCircle = Math.round (100 * b * Math.cos(2 * Math.PI * a/b));
                yCircle = Math.round (100 * b * Math.sin(2 * Math.PI * a/b));
              }
              this.fireworks.push(new Fireworks(this.canvas, this.ctx, item.x, item.y, item.x+xCircle, item.y+yCircle, item.color, false));
            }
          }
          this.fireworks.splice(f, 1);
        } else {
          f++;
        }
      }
      this.fireworks.forEach((item) => {
        item.loopFireworks();
      });
    }
  } // loopModel

  /*drawEntity2() {
    super.drawEntity2();

    this.ratio = Math.round(this.canvas.element.width/40);
    var yRatio = Math.round(this.canvas.element.height/33);
    if (yRatio < this.ratio) {
      this.ratio = yRatio;
      if (this.ratio < 1) {
        this.ratio = 1;
      }
    }

    var alpha = 1;
    if (this.timeDiff < 1000) {
      alpha = this.timeDiff/1000;
    }
    this.ctx.fillStyle = 'rgba(0, 0, 0, '+alpha+')';
    this.ctx.fillRect(0, 0, this.canvas.element.width, this.canvas.element.height);

    if (this.timeDiff > 1000) {
      this.fireworks.forEach((item) => {
        item.drawFireworks(this.ratio);
      });
    }
  } // drawEntity2*/

} // class GameOverModel

export default GameOverModel;
