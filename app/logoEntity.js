/**/
const { TextEntity } = await import('./svision/js/platform/canvas2D/textEntity.js?ver='+window.srcVersion);
/*/
import TextEntity from './svision/js/platform/canvas2D/textEntity.js';
/**/
// begin code

export class LogoEntity extends TextEntity {

  constructor(parentEntity, x, y, width, height, penColor, flashColor, bkColor, scale) {
    super(parentEntity, x, y, width, height);
    this.id = 'LogoEntity';
    
    this.proportional = true;
    this.justify = 0;
    this.animateState = 0;
    this.text = 'JET SET WILlY';
    this.scale = scale;
    this.penColor = penColor;
    this.flashColor = flashColor;
    this.bkColor = bkColor;

    this.logoFonts = {
      ' ': {width: 1, data: []},
      'J': {width: 4, data: [[0,0,3,1], [1,1,1,4], [0,4,1,1]]},
      'E': {width: 4, data: [[0,0,3,1], [0,1,1,4], [1,2,2,1], [1,4,2,1]]},
      'T': {width: 4, data: [[0,0,3,1], [1,1,1,4]]},
      'S': {width: 4, data: [[0,0,3,1], [0,2,3,1], [0,4,3,1], [0,1,1,1], [2,3,1,1]]},
      'W': {width: 6, data: [[0,0,1,5], [4,0,1,5], [2,2,1,2], [1,4,3,1]]},
      'I': {width: 2, data: [[0,0,1,5]]},
      'L': {width: 4, data: [[0,0,1,5], [1,4,2,1]]},
      'l': {width: 3, data: [[0,0,1,5], [1,4,2,1]]},
      'Y': {width: 6, data: [[0,0,1,3], [4,0,1,3], [1,2,3,1], [2,3,1,2]]},
    }
  } // constructor

  getTextChar(position) {
    return this.text[position];
  } // getTextChar

  getTextLength() {
    return this.text.length;
  } // getTextLength

  getPenColorChar(position) {
    if (this.app.stack.flashState == true) {
      return this.flashColor;
    }
    return this.penColor;
  } // getPenColorChar

  getCharData(char, bitMask) {
    var charObject = {};
    charObject.width = this.logoFonts[char].width*this.scale;

    charObject.data = [];
    for (var x = 0; x < this.logoFonts[char].data.length; x++) {
      var piece = this.logoFonts[char].data[x];
      charObject.data.push([piece[0]*this.scale, piece[1]*this.scale, piece[2]*this.scale, piece[3]*this.scale]);
    }

    return charObject;
  } // getCharData

  handleEvent(event) {
    switch (event.id) {
      case 'changeFlashState':
        this.drawingCache[0].cleanCache();
        break;
    }
    return super.handleEvent(event);
  } // handleEvent

} // class LogoEntity

export default LogoEntity;
