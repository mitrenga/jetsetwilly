/**/
const { AbstractAudioManager } = await import('./svision/js/abstractAudioManager.js?ver='+window.srcVersion);
const { AudioWorkletHandler } = await import('./svision/js/audioWorkletHandler.js?ver='+window.srcVersion);
const { AudioScriptProcessorHandler } = await import('./svision/js/audioScriptProcessorHandler.js?ver='+window.srcVersion);
/*/
import AbstractAudioManager from './svision/js/abstractAudioManager.js';
import AudioWorkletHandler from './svision/js/audioWorkletHandler.js';
import AudioScriptProcessorHandler from './svision/js/audioScriptProcessorHandler.js';
/**/
// begin code

export class AudioManager extends AbstractAudioManager {
  
  constructor(app) {
    super(app);
    this.id = 'AudioManager';
    this.sounds = 0.3;
    this.music = 0.3;
  } // constructor

  createAudioHandler() {
    var audioHandler = false;

    switch (this.unsupportedAudioChannel) {
      case false:
        audioHandler = new AudioWorkletHandler(this.app);
        break;
      case 'AudioWorkletHandler':
        audioHandler = new AudioScriptProcessorHandler(this.app);
        break;
    }

    return audioHandler;
  } // createAudioHandler

} // class AudioManager

export default AudioManager;
