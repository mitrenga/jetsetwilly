/**/
const { AbstractAudioManager } = await import('./svision/js/abstractAudioManager.js?ver='+window.srcVersion);
const { appAudioHandler } = await import('./appAudioHandler.js?ver='+window.srcVersion);
/*/
import AbstractAudioManager from './svision/js/abstractAudioManager.js';
import appAudioHandler from './appAudioHandler.js';
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
    return appAudioHandler(this.app);
  } // createAudioHandler

} // class AudioManager

export default AudioManager;
