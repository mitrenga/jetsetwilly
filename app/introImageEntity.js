/**/
const { ZXVideoRAMEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxVideoRAMEntity.js?ver='+window.srcVersion);
/*/
import ZXVideoRAMEntity from './svision/js/platform/canvas2D/zxSpectrum/zxVideoRAMEntity.js';
/**/
// begin code

export class IntroImageEntity extends ZXVideoRAMEntity {

  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, width, height);
    this.id = 'IntroImageEntity';

    this.introImageTriangles = [
      "C0F0FCFFFFFFFFFF",
      "00000000C0F0FCFF",
      "FFFFFFFFFCF0C000",
      "FCF0C00000000000"
    ]; // introImageTriangles

    this.introImageAttributes = [
      "0000000000000000000000000000000000000000000000000000000000000000",
      "0000000000000000000000000000000000000000000000000000000000000000",
      "0000000000000000000000000000000000002828050500000000000000000000",
      "00000000D3D3D300D3D3D300D3D3D30028D3D3D325D3D3D300D3D3D300000000",
      "0000000000D30000D300000000D328282DD3252524D300000000D30000000000",
      "0000000000D30000D3D3D30028D32D2D25D3D3D324D3D3D30000D30000000000",
      "0000000000D30000D30028282DD3252524240CD324D300000000D30000000000",
      "00000000D3D30000D3D3D32D25D3242404D3D3D324D3D3D30000D30000000000",
      "000000000000000029292D2D2C2C040400000909242400000000000000000000",
      "0000000000000000090929292D2D050500000909242400000000000000000000",
      "000000000000D3000808D309D329D32D0505D30924D3000000D3000000000000",
      "000000000000D3000000D308D309D3292D2DD30924D3000000D3000000000000",
      "000000000000D300D300D300D308D3092929D30924D3D3D3D3D3000000000000",
      "000000000000D300D300D300D300D3080909D309242400D30000000000000000",
      "000000000000D3D3D3D3D300D300D3D3D308D3D3D32400D30000000000000000",
      "0000000000000000000000000000000000000808040400000000000000000000",
    ]; // introImageAttributes
  } // constructor

  getVideoRAMValue(addr) {
    if (addr < 4096) {
      var row = Math.floor(addr/32);
      var column = addr%32;
      var triangle = false;
      switch (this.introImageAttributes[row%8+Math.floor(row/64)*8].substring(column*2, column*2+2)) {
        case '05':
        case '08':
        case '29':
        case '2C':
          triangle = 0;
          break;
        case '04':
        case '0C':
        case '25':              
        case '28':
          triangle = 2;
          break;
      }
      if (triangle === false) {
        return '00';
      }
      return this.introImageTriangles[triangle+addr%2].substring(Math.floor(addr%2048/256)*2, Math.floor(addr%2048/256)*2+2);
    }
    if (addr > 6143) {
      var attr = this.introImageAttributes[Math.floor((addr-6144)/32)].substring(((addr-6144)%32)*2, ((addr-6144)%32)*2+2);
      if (attr == '2C') {
        attr = '25';
      }
      return attr;
    }
    return false;
  } // getVideoRAMValue

} // class IntroImageEntity

export default IntroImageEntity;
