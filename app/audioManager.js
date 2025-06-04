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
    this.sounds = Number(this.app.getCookie('audioChannelSounds', 0.3));
    this.music = Number(this.app.getCookie('audioChannelMusic', 0.3));
  } // constructor

createAudioHandler() {
    var audioHandler = false;

    if (this.unsupportedAudioChannel == false) {
      this.unsupportedAudioChannel = this.app.getCookie('unsupportedAudioChannel', false);
    }

    switch (this.unsupportedAudioChannel) {
      case false:
        audioHandler = new AudioWorkletHandler(this.app);
        break;
      case 'AudioWorkletHandler':
        this.app.setCookie('unsupportedAudioChannel', 'AudioWorkletHandler');
        audioHandler = new AudioScriptProcessorHandler(this.app);
        break;
      case 'AudioScriptProcessorHandler':
        this.app.setCookie('unsupportedAudioChannel', 'AudioScriptProcessorHandler');
        break;
    }

    return audioHandler;
  } // createAudioHandler

  audioData(channel, sound, options) {
    var sampleRate = this.channels[channel].ctx.sampleRate;
    switch (sound) {
      case 'tapePilotTone': return this.tapePilotToneData(sampleRate);
    }
    return false;
  } // audioData

  tapePilotToneData(sampleRate) {
    // T-state is 1/3500000 = 0.0000002867 sec. 
    // leader pulse is 2,168 T-states long and is repeated 8,063 times for header blocks and 3,223 times for data blocks
    var pulse = Math.round(sampleRate*2168/3500000);
    var audioData = Array(pulse*2);
    audioData.fill(this.sounds, 0, pulse);
    audioData.fill(0, pulse, pulse*2);
    return audioData;
  } // tapePilotToneData

} // class AudioManager

export default AudioManager;
