/**/
const { AbstractFonts } = await import('./svision/js/abstractFonts.js?ver='+window.srcVersion);
/*/
import AbstractFonts from './svision/js/abstractFonts.js';
/**/
// begin code

export class MainFonts extends AbstractFonts {

  constructor(app) {
    super(app);
    this.id = 'MainFonts';

    this.charsHeight = 5; 
    this.charsSpacing = 1;
    this.lineSpacing = 2;
    this.paragraphSpacing = 7;
    
    this.fontsData = {
      ' ': {width: 2, data: []},
      'A': {width: 4, data: [[0,0,4,1], [0,1,1,6], [1,3,2,1], [3,1,1,6]]},
      'C': {width: 4, data: [[0,0,4,1], [0,1,1,5], [0,6,4,1]]},
      'E': {width: 4, data: [[0,0,4,1], [0,1,1,6], [1,3,3,1], [1,6,3,1]]},
      'L': {width: 4, data: [[0,0,1,7], [1,6,3,1]]},
      'M': {width: 5, data: [[0,0,1,7], [1,1,1,1], [2,2,1,1], [3,1,1,1], [4,0,1,7]]},
      'O': {width: 4, data: [[0,0,4,1], [0,1,1,5], [3,1,1,5], [0,6,4,1]]},
      'P': {width: 4, data: [[0,0,4,1], [0,1,1,6], [1,3,3,1], [3,1,1,2]]},
      'R': {width: 4, data: [[0,0,4,1], [0,1,1,6], [1,3,3,1], [3,1,1,2], [1,4,1,1], [2,5,1,1], [3,6,1,1]]},
      'S': {width: 4, data: [[0,0,4,1], [0,1,1,2], [0,3,4,1], [3,4,1,2], [0,6,4,1]]},
      'T': {width: 5, data: [[0,0,5,1], [2,1,1,6]]}
    }
  } // constructor

  getCharData(char, bitMask, scale) {
    var validChar = char.toUpperCase();
    if (!(validChar in this.fontsData)) {
      validChar = '?';
    }
    var charObject = {};
    charObject.width = this.fontsData[validChar].width*scale;

    charObject.data = [];
    for (var x = 0; x < this.fontsData[validChar].data.length; x++) {
      var piece = this.fontsData[validChar].data[x];
      charObject.data.push([piece[0]*scale, piece[1]*scale, piece[2]*scale, piece[3]*scale]);
    }

    return charObject;
  } // getCharData

  validChar(char) {
    if (char in this.fontsData) {
      return true;
    }
    return false;
  } // validChar

} // MainFonts

export default MainFonts;
