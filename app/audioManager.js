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

createAudioHandler(channel) {
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
      case 'tapeRndToneData': return this.tapeRndToneData(sampleRate);
      case 'cycleBasicBeepsData': return this.cycleBasicBeepsData(sampleRate);
      case 'pressKeyboardData': return this.pressKeyboardData(sampleRate);
     }
    return false;
  } // audioData

  tapePilotToneData(sampleRate) {
    // T-state is 1/3500000 = 0.0000002867 sec. 
    // leader pulse is 2168 T-states long and is repeated 8063 times for header blocks and 3223 times for data blocks
    var pulse = Math.ceil(sampleRate*2168/3500000);
    var fragments = [pulse];
    var pulses = [0];
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds};
  } // tapePilotToneData

  tapeRndToneData(sampleRate) {
    // two sync pulses of 667 and 735 T-states
    var f667 = Math.ceil(sampleRate*667/3500000);
    var f735 = Math.ceil(sampleRate*735/3500000);
    // data is encoded as two 855 T-state pulses for binary zero, and two 1710 T-state pulses for binary one
    var f885 = Math.ceil(sampleRate*855/3500000);
    var f1710 = Math.ceil(sampleRate*1710/3500000);

    var fragments = [f667, f735, f885, f1710];
    var pulses = [0, 0, 1, 1];
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds, 'infinityRndPulses': {'fragments': [2, 3], 'quantity': 2}};
  } // tapeRndToneData

  cycleBasicBeepsData(sampleRate) {
    var beeps = [261.626, 293.665, 329.628, 369.994, 415.305, 466.164, 523.251];
    
    var fragments = [];
    for (var x = 0; x < beeps.length; x++) {
      fragments.push(Math.ceil(sampleRate/beeps[x]/2));
    }
    fragments.push(Math.ceil(sampleRate/44));

    var pulses = [];
    for (var x = 0; x < beeps.length; x++) {
      var duration = 0;
      do {
        pulses.push(x);
        duration = duration+fragments[x];
      } while (duration < sampleRate/10);
      pulses.push(beeps.length);
    }
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds};
  } // cycleBasicBeepsData

  pressKeyboardData(sampleRate) {
    var pulse = Math.ceil(15*sampleRate/44100);
    var fragments = [pulse];
    var pulses = [0];
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds};
  } // pressKeyboardData

} // class AudioManager

export default AudioManager;
