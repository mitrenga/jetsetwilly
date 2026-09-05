const { ZXSpectrumPlatform } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxSpectrumPlatform.js?ver='+window.srcVersion);
// begin code

export function appPlatform() {
  return new ZXSpectrumPlatform();
} // appPlatform
