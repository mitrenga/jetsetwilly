/**/
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
/*/
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
/**/
// begin code

export class LogoEntity extends TextEntity {

  constructor(model, x, y, width, height, logoType) {
    super(model, x, y, width, height);
    this.id = 'LogoEntity';
    
    this.proportional = true;
    this.justify = 0;
    this.animateState = 0;
    this.logoType = logoType;

    this.logoFonts = {
      ' ': {width: 1, data: []},
      J: {width: 4, data: [[0,0,3,1], [1,1,1,4], [0,4,1,1]]},
      E: {width: 4, data: [[0,0,3,1], [0,1,1,4], [1,2,2,1], [1,4,2,1]]},
      T: {width: 4, data: [[0,0,3,1], [1,1,1,4]]},
      S: {width: 4, data: [[0,0,3,1], [0,2,3,1], [0,4,3,1], [0,1,1,1], [2,3,1,1]]},
      W: {width: 6, data: [[0,0,1,5], [4,0,1,5], [2,2,1,2], [1,4,3,1]]},
      I: {width: 2, data: [[0,0,1,5]]},
      L: {width: 4, data: [[0,0,1,5], [1,4,2,1]]},
      Ł: {width: 3, data: [[0,0,1,5], [1,4,2,1]]},
      Y: {width: 6, data: [[0,0,1,3], [4,0,1,3], [1,2,3,1], [2,3,1,2]]}
    }

    this.logoLabel = "JET SET WILŁY";
  } // constructor

  getTextChar(position) {
    return this.logoLabel[position];
  } // getTextChar

  getTextLength() {
    return this.logoLabel.length;
  } // getTextLength

  getPenColorChar(position) {
    if (this.flashState == true) {
      return 'rgb(155, 155, 155)';
    }
    return 'rgb(91, 91, 91)';
  } // getPenColorChar

  getCharData(char, bitMask) {
    var charObject = {};
    charObject['width'] = this.logoFonts[char]['width']*2;

    charObject['data'] = [];
    for (var x = 0; x < this.logoFonts[char]['data'].length; x++) {
      var piece = this.logoFonts[char]['data'][x];
      charObject['data'].push([piece[0]*2, piece[1]*2, piece[2]*2, piece[3]*2]);
    }

    return charObject;
  } // getCharData

} // class LogoEntity

export default LogoEntity;
