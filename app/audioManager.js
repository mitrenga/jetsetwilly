/**/
const { AbstractAudioManager } = await import('./svision/js/abstractAudioManager.js?ver='+window.srcVersion);
const { AudioWorkletHandler } = await import('./svision/js/audioWorkletHandler.js?ver='+window.srcVersion);
const { AudioScriptProcessorHandler } = await import('./svision/js/audioScriptProcessorHandler.js?ver='+window.srcVersion);
const { AudioDisableHandler } = await import('./svision/js/audioDisableHandler.js?ver='+window.srcVersion);
/*/
import AbstractAudioManager from './svision/js/abstractAudioManager.js';
import AudioWorkletHandler from './svision/js/audioWorkletHandler.js';
import AudioScriptProcessorHandler from './svision/js/audioScriptProcessorHandler.js';
import AudioDisableHandler from './svision/js/audioDisableHandler.js';
/**/
// begin code

export class AudioManager extends AbstractAudioManager {
  
  constructor(app) {
    super(app);
    this.id = 'AudioManager';
    this.sounds = Number(this.app.getCookie('audioChannelSounds', 0.2));
    this.music = Number(this.app.getCookie('audioChannelMusic', 0.1));
  } // constructor

createAudioHandler(channel) {
    var audioHandler = false;

    var volume = 0.0;
    switch (channel) {
      case 'music':
        volume = this.music;
        break;
      case 'sounds':
      case 'extra':
        volume = this.sounds;
        break;
    }

    if (volume == 0.0) {
      return new AudioDisableHandler(this.app);
    }

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
    var data = super.audioData(channel, sound, options);
    if (data !== false) {
      return data;
    }

    var sampleRate = this.channels[channel].getSampleRate();
    switch (sound) {
      case 'titleScreenMelody': return this.titleScreenMelody(sampleRate);
      case 'screechSound': return this.screechSound(sampleRate);
      case 'inGameMelody': return this.inGameMelody(sampleRate, options.lives);
      case 'jumpSound': return this.jumpSound(sampleRate);
      case 'fallingSound': return this.fallingSound(sampleRate);
      case 'itemSound': return this.itemSound(sampleRate);
      case 'arrowSound': return this.arrowSound(sampleRate);
      case 'gameOverSound': return this.gameOverSound(sampleRate);
      case 'tapePilotToneSound': return this.tapePilotToneSound(sampleRate);
      case 'tapeRndDataSound': return this.tapeRndDataSound(sampleRate);
      case 'basicBeepsSound': return this.basicBeepsSound(sampleRate);
      case 'keyboardSound': return this.keyboardSound(sampleRate);
     }
    return false;
  } // audioData

  extendArray(array, addition) {
    var newArray = new Uint8Array(array.length+addition);
    newArray.set(array, 0);
    return newArray;
  } // extendArray

  resizeArray(array, length) {
    var newArray = new Uint8Array(length);
    newArray.set(array.slice(0, length), 0);
    return newArray;
  } // resizeArray

  addPulse(frame, k, lastPos, fKeys, fragments, pulses, pulsesCounter) {
    var newPos = Math.round(frame*k);
    var pulse = newPos-lastPos;
    if (!(pulse in fKeys)) {
      fKeys[pulse] = fragments.length;
      fragments.push(pulse);
    }
    pulses[pulsesCounter] = fKeys[pulse];
    return newPos;
  } // addPulse

  titleScreenMelody(sampleRate) {
    var titleScreenTuneData = [
      0x51,0x3C,0x33,0x51,0x3C,0x33,0x51,0x3C,0x33,0x51,0x3C,0x33,0x51,0x3C,0x33,0x51,0x3C,0x33,0x51,0x3C,0x33,0x51,0x3C,0x33,0x4C,0x3C,0x33,0x4C,0x3C,0x33,0x4C,0x39,0x2D,
      0x4C,0x39,0x2D,0x51,0x40,0x2D,0x51,0x3C,0x33,0x51,0x3C,0x36,0x5B,0x40,0x36,0x66,0x51,0x3C,0x51,0x3C,0x33,0x51,0x3C,0x33,0x28,0x3C,0x28,0x28,0x36,0x2D,0x51,0x36,0x2D,
      0x51,0x36,0x2D,0x28,0x36,0x28,0x28,0x3C,0x33,0x51,0x3C,0x33,0x26,0x3C,0x2D,0x4C,0x3C,0x2D,0x28,0x40,0x33,0x51,0x40,0x33,0x2D,0x40,0x36,0x20,0x40,0x36,0x3D,0x79,0x3D
    ];

    var fragments = [];
    var fKeys = {};
    var pulses = new Uint8Array(33000);
    var pulsesCounter = 0;
    var events = {};

    var k = Math.round(sampleRate/860)/100;
    var frame = 0;
    var lastPos = -1;

    for (var t = 0; t < titleScreenTuneData.length-3; t++) {
      var b = 256;
      var c = 100;
      var e = titleScreenTuneData[t];
      var d = e;
      do {
        do {
          d--;
          if (d == 0) {
            d = e;
            if (pulsesCounter == pulses.length) {
              pulses = this.extendArray(pulses, 5000);
            }
            lastPos = this.addPulse(frame, k, lastPos, fKeys, fragments, pulses, pulsesCounter);
            pulsesCounter++;
          }
          b--;
          frame++;
        } while (b > 0);
        b = 256;
        if (c == 50) {
          e = e*2;
        }
        c--;
      } while (c > 0);
    }
    pulses = this.resizeArray(pulses, pulsesCounter);
    events[pulsesCounter] = {'id': 'melodyEnd'};
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.music, 'events': events};
  } // titleScreenMelody

  screechSound(sampleRate) {
    var fragments = [];
    var fKeys = {};
    var pulses = new Uint8Array(4500);
    var pulsesCounter = 0;
    var events = {};

    var k = Math.round(sampleRate/865)/100;
    var frame = 0;
    var lastPos = -1;

    for (var o = 0; o < 7; o++) {
      for (var t = 50; t < 81; t++) {
        var a = t;
        var e = a;
        do {
          var b = e;
          do {
            if (a == b) {
              if (pulsesCounter == pulses.length) {
                pulses = this.extendArray(pulses, 500);
              }
              lastPos = this.addPulse(frame, k, lastPos, fKeys, fragments, pulses, pulsesCounter);
              pulsesCounter++;
            }
            frame++;
            b--;
          } while (b > 0);
          a--;
          if (pulsesCounter == pulses.length) {
            pulses = this.extendArray(pulses, 500);
          }
          lastPos = this.addPulse(frame, k, lastPos, fKeys, fragments, pulses, pulsesCounter);
          pulsesCounter++;
        } while (a > 0);
        frame = frame+1941;
        if (pulsesCounter == pulses.length) {
          pulses = this.extendArray(pulses, 500);
        }
        lastPos = this.addPulse(frame, k, lastPos, fKeys, fragments, pulses, pulsesCounter);
        pulsesCounter++;
      }
    }
    pulses = this.resizeArray(pulses, pulsesCounter);
    events[0] = {'id': 'screechBegin', 'duration': Math.round(lastPos/sampleRate*1000)};
    events[pulsesCounter] = {'id': 'screechEnd'};
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.music, 'events': events};
  } // screechSound

  inGameMelody(sampleRate, lives) {
    var inGameTuneData = [
      0x56,0x60,0x56,0x60,0x66,0x66,0x80,0x80,0x80,0x80,0x66,0x60,0x56,0x60,0x56,0x60,0x66,0x60,0x56,0x4C,0x48,0x4C,0x48,0x4C,0x56,0x56,0x56,0x56,0x56,0x56,0x56,0x56,
      0x40,0x40,0x40,0x40,0x44,0x44,0x4C,0x4C,0x56,0x60,0x66,0x60,0x56,0x56,0x66,0x66,0x51,0x56,0x60,0x56,0x51,0x51,0x60,0x60,0x40,0x40,0x40,0x40,0x40,0x40,0x40,0x40
    ];

    var fragments = [];
    var fKeys = {};
    var pulses = new Uint8Array(1500);
    var pulsesCounter = 0;

    var k = Math.round(sampleRate/860)/100;
    var frame = 0;
    var lastPos = -1;
    var m = 0;

    for (var r = 0; r < 2; r++) {
      for (var t = 0; t < inGameTuneData.length; t++) {
        m++;
        var n = (m&126)>>1;
        var e = inGameTuneData[n]+28-4*lives;
        var b = 256;
        var c = 3;
        do {
          do {
            e--;
            if (e == 0) {
              var e = inGameTuneData[n]+28-4*lives;
              if (pulsesCounter == pulses.length) {
                pulses = this.extendArray(pulses, 500);
              }
              lastPos = this.addPulse(frame, k, lastPos, fKeys, fragments, pulses, pulsesCounter);
              pulsesCounter++;
            }
            b--;
            frame++;
          } while (b > 0)
          b = 256;
          c--;
        } while (c > 0)
        frame = frame+6700;
        if (pulsesCounter == pulses.length) {
          pulses = this.extendArray(pulses, 500);
        }
        lastPos = this.addPulse(frame, k, lastPos, fKeys, fragments, pulses, pulsesCounter);
        pulsesCounter++;
      }
    }

    pulses = this.resizeArray(pulses, pulsesCounter);
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.music};
  } // inGameMelody

  jumpSound(sampleRate) {
    var fragments = [];
    var pulses = new Uint8Array(30*18+18+33*27);
    var pulsesCounter = 0;
    
    var k = Math.round(sampleRate/658)/100;
    fragments.push(Math.round(sampleRate/12.6));
    
    for (var x = 0; x < 18; x++) {
      var d = Math.round(2*(1+Math.abs(7-x))*k);
      fragments.push(d);
      for (var o = 0; o < 29; o++) {
        if (pulsesCounter == pulses.length) {
          pulses = this.extendArray(pulses, 100);
        }
        pulses[pulsesCounter] = fragments.length-1;
        pulsesCounter++;
      }
      if (pulsesCounter == pulses.length) {
        pulses = this.extendArray(pulses, 100);
      }
      pulses[pulsesCounter] = 0;
      pulsesCounter++;
    }

    k = Math.round(sampleRate/441)/100;
    
    var p = 4;
    for (var x = 0; x < 27; x++) {
      var d = Math.round(7+2.2*p*k);
      p++;
      if (p == 16) {
        p = 12;
      }
      fragments.push(d);
      for (var o = 0; o < 31; o++) {
        if (pulsesCounter == pulses.length) {
          pulses = this.extendArray(pulses, 100);
        }
        pulses[pulsesCounter] = fragments.length-1;
        pulsesCounter++;
      }
      if (pulsesCounter == pulses.length) {
        pulses = this.extendArray(pulses, 100);
      }
      pulses[pulsesCounter] = 0;
      pulsesCounter++;
    }

    pulses = this.resizeArray(pulses, pulsesCounter);
    this.audioDataCache.sounds.jumpSound = {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds};
    return this.audioDataCache.sounds.jumpSound;
  } // jumpSound


  fallingSound(sampleRate) {
    var fragments = [];
    var pulses = new Uint8Array(32*27);
    var pulsesCounter = 0;
    
    var k = Math.round(sampleRate/441)/100;
    fragments.push(Math.round(sampleRate/12.6));
    
    var p = 0;
    for (var x = 0; x < 27; x++) {
      var d = Math.round(7+2.2*p*k);
      p++;
      if (p == 16) {
        p = 12;
      }
      fragments.push(d);
      for (var o = 0; o < 31; o++) {
        if (pulsesCounter == pulses.length) {
          pulses = this.extendArray(pulses, 100);
        }
        pulses[pulsesCounter] = fragments.length-1;
        pulsesCounter++;
      }
      if (pulsesCounter == pulses.length) {
        pulses = this.extendArray(pulses, 100);
      }
      pulses[pulsesCounter] = 0;
      pulsesCounter++;
    }

    pulses = this.resizeArray(pulses, pulsesCounter);
    this.audioDataCache.sounds.fallingSound = {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds};
    return this.audioDataCache.sounds.fallingSound;
  } // fallingSound

  itemSound(sampleRate) {
    var fragments = [];
    var pulses = new Uint8Array(64);
    var pulsesCounter = 0;
    
    var k = Math.round(sampleRate/2400)/100;

    var c = 128;
    do {
      var b = 144-c;
      var p = Math.round(b*k)
      fragments.push(p);
      if (pulsesCounter == pulses.length) {
        pulses = this.extendArray(pulses, 10);
      }
      pulses[pulsesCounter] = fragments.length-1;
      pulsesCounter++;
      c = c-2;
    } while (c > 0);

    pulses = this.resizeArray(pulses, pulsesCounter);
    this.audioDataCache.extra.itemSound = {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds};
    return this.audioDataCache.extra.itemSound;
  } // itemSound

  arrowSound(sampleRate) {
    var fragments = [];
    var pulses = new Uint8Array(64);
    var pulsesCounter = 0;
    
    var k = Math.round(sampleRate/2400)/100;

    var b = 2;
    var c = 128;
    do {
      var p = Math.round(b*k)
      fragments.push(p);
      if (pulsesCounter == pulses.length) {
        pulses = this.extendArray(pulses, 10);
      }
      pulses[pulsesCounter] = fragments.length-1;
      pulsesCounter++;
      b = c;
      c--;
    } while (c > 0);

    pulses = this.resizeArray(pulses, pulsesCounter);
    this.audioDataCache.extra.arrowSound = {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds};
    return this.audioDataCache.extra.arrowSound;
  } // arrowSound

  gameOverSound(sampleRate) {
    var fragments = [];
    var fKeys = {};
    var pulses = new Uint8Array((255-59)/4*64);
    var pulsesCounter = 0;
    
    var k = Math.round(sampleRate/2800)/100;
    fragments.push(Math.round(sampleRate/212));

    for (var x = 255; x > 59; x=x-4) {
      for (var o = 0; o < 63; o++) {
        var d = Math.round(x*k);
        if (!(d in fKeys)) {
          fragments.push(d);
          fKeys[d] = fragments.length-1;
        }
        if (pulsesCounter == pulses.length) {
          pulses = this.extendArray(pulses, 100);
        }
        pulses[pulsesCounter] = fKeys[d];
        pulsesCounter++;
      }
      if (pulsesCounter == pulses.length) {
        pulses = this.extendArray(pulses, 100);
      }
      pulses[pulsesCounter] = 0;
      pulsesCounter++;
    }

    pulses = this.resizeArray(pulses, pulsesCounter);
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds};
  } // gameOverSound

  tapePilotToneSound(sampleRate) {
    // T-state is 1/3500000 = 0.0000002867 sec. 
    // leader pulse is 2168 T-states long and is repeated 8063 times for header blocks and 3223 times for data blocks
    var pulse = Math.ceil(sampleRate*2168/3500000);
    var fragments = [pulse];
    var pulses = [0];
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds};
  } // tapePilotToneSound

  tapeRndDataSound(sampleRate) {
    // two sync pulses of 667 and 735 T-states
    var f667 = Math.ceil(sampleRate*667/3500000);
    var f735 = Math.ceil(sampleRate*735/3500000);
    // data is encoded as two 855 T-state pulses for binary zero, and two 1710 T-state pulses for binary one
    var f885 = Math.ceil(sampleRate*855/3500000);
    var f1710 = Math.ceil(sampleRate*1710/3500000);

    var fragments = [f667, f735, f885, f1710];
    var pulses = [0, 0, 1, 1];
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds, 'infinityRndPulses': {'fragments': [2, 3], 'quantity': 2}};
  } // tapeRndDataSound

  basicBeepsSound(sampleRate) {
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
  } // basicBeepsSound

  keyboardSound(sampleRate) {
    var pulse = Math.ceil(15*sampleRate/44100);
    var fragments = [pulse];
    var pulses = [0];
    return {'fragments': fragments, 'pulses': pulses, 'volume': this.sounds};
  } // keyboardSound

} // class AudioManager

export default AudioManager;
