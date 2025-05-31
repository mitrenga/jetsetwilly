/**/

/*/

/**/
// begin code

class SoundsProcessor extends AudioWorkletProcessor {

  constructor(...args) {
    super(...args);
    this.paused = false;
    this.port.onmessage = (e) => {
      switch (e.data) {
        case 'pause':
          this.paused = true;
          break;
        case 'continue':
          this.paused = false;
          break;
        }
    };
  } // constructor

  process (inputs, outputs, parameters) {
    if (!this.paused) {
      const output = outputs[0];
      output.forEach((channel) => {
        for (let i = 0; i < channel.length; i++) {
          channel[i] = ((i < channel.length/2) ? 1 : 0);
        }
      });
    }
    return true;
  } // process

} // SoundsProcessor

registerProcessor('soundsProcessor', SoundsProcessor);
