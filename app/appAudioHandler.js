/**/
const { AudioWorkletHandler } = await import('./svision/js/audioWorkletHandler.js?ver='+window.srcVersion);
const { AudioScriptProcessorHandler } = await import('./svision/js/audioScriptProcessorHandler.js?ver='+window.srcVersion);
/*/
import AudioWorkletHandler from './svision/js/audioWorkletHandler.js';
import AudioScriptProcessorHandler from './svision/js/audioScriptProcessorHandler.js';
/**/
// begin code


export function appAudioHandler(app) {

  var audioHandler = false;

  switch (app.audioManager.unsupportedAudioChannel) {
    case false:
      audioHandler = new AudioWorkletHandler(app);
      break;
    case 'AudioWorkletHandler':
      audioHandler = new AudioScriptProcessorHandler(app);
      break;
  }

  return audioHandler;
} // appAudioHandler

export default appAudioHandler;