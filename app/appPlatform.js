/**/
const { ZXSpectrumPlatform } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxSpectrumPlatform.js?ver='+window.srcVersion);
/*/
import ZXSpectrumPlatform from './svision/js/platform/canvas2D/zxSpectrum/zxSpectrumPlatform.js';
/**/
// begin code

export var appPlatform = new ZXSpectrumPlatform();

export default appPlatform;