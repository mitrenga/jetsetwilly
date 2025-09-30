/**/
const { AbstractFonts } = await import('./svision/js/abstractFonts.js?ver='+window.srcVersion);
/*/
import AbstractFonts from './svision/js/abstractFonts.js';
/**/
// begin code

export class SignboardFonts extends AbstractFonts {

  constructor(app) {
    super(app);
    this.id = 'SignboardFonts';
    
    this.fontsData = {
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

  getCharData(char, bitMask, align, scale) {
    var charObject = {};
    charObject.width = this.fontsData[char].width*scale;

    charObject.data = [];
    for (var x = 0; x < this.fontsData[char].data.length; x++) {
      var piece = this.fontsData[char].data[x];
      charObject.data.push([piece[0]*scale, piece[1]*scale, piece[2]*scale, piece[3]*scale]);
    }
    return charObject;
  } // getCharData

} // class SignboardFonts

export default SignboardFonts;
