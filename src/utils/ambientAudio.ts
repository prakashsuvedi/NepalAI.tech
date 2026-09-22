/**
 * Ambient Focus Audio Generator (Web Audio API)
 * Generates a subtle, meditative binaural focus atmosphere:
 * - 108Hz / 114Hz Theta wave binaural frequency differential (6Hz focus pulse)
 * - Soft filtered warmth layer with gentle breathing modulation
 * - Pure procedural synthesis: 0 bytes downloaded, offline-ready, zero latency
 */

class AmbientFocusAudio {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private nodes: (AudioNode | number)[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play() {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, now);
      // Smooth fade-in to an unobtrusive background level (0.12)
      this.masterGain.gain.exponentialRampToValueAtTime(0.12, now + 1.2);
      this.masterGain.connect(this.ctx.destination);

      // 1. Binaural Left Carrier (108 Hz)
      const oscL = this.ctx.createOscillator();
      const panL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      const gainL = this.ctx.createGain();
      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(108, now);
      gainL.gain.value = 0.35;

      if (panL) {
        panL.pan.value = -0.85;
        oscL.connect(gainL).connect(panL).connect(this.masterGain);
      } else {
        oscL.connect(gainL).connect(this.masterGain);
      }
      oscL.start(now);
      this.nodes.push(oscL);

      // 2. Binaural Right Carrier (114 Hz -> 6Hz Theta Focus Pulse)
      const oscR = this.ctx.createOscillator();
      const panR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      const gainR = this.ctx.createGain();
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(114, now);
      gainR.gain.value = 0.35;

      if (panR) {
        panR.pan.value = 0.85;
        oscR.connect(gainR).connect(panR).connect(this.masterGain);
      } else {
        oscR.connect(gainR).connect(this.masterGain);
      }
      oscR.start(now);
      this.nodes.push(oscR);

      // 3. Sub-harmonic Warm Drone (54 Hz)
      const oscSub = this.ctx.createOscillator();
      const gainSub = this.ctx.createGain();
      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(54, now);
      gainSub.gain.value = 0.2;
      oscSub.connect(gainSub).connect(this.masterGain);
      oscSub.start(now);
      this.nodes.push(oscSub);

      // 4. Soft Himalayan Breeze Pink Noise with 30s breathing cycle
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.035;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Lowpass filter for deep velvety warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);

      // Gentle LFO for 30s breathing cycle
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(1 / 30, now); // 30-second cycle
      lfoGain.gain.setValueAtTime(80, now);
      lfo.connect(filter.frequency);
      lfo.start(now);
      this.nodes.push(lfo);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = 0.25;

      whiteNoise.connect(filter).connect(noiseGain).connect(this.masterGain);
      whiteNoise.start(now);
      this.nodes.push(whiteNoise);

      this.isPlaying = true;
    } catch (err) {
      console.warn('Web Audio ambient focus play prevented:', err);
      this.isPlaying = false;
    }
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      setTimeout(() => {
        this.nodes.forEach((node) => {
          if (typeof node === 'object' && 'stop' in node && typeof node.stop === 'function') {
            try {
              node.stop();
            } catch {
              // Ignore stopped node errors
            }
          }
        });
        this.nodes = [];
        this.isPlaying = false;
      }, 850);
    } catch (err) {
      console.warn('Web Audio stop error:', err);
      this.isPlaying = false;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public getActive(): boolean {
    return this.isPlaying;
  }
}

export const ambientFocusAudio = new AmbientFocusAudio();
