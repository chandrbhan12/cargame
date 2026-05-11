export class SoundManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.enabled = true;
    
    // Realistic Engine Synthesis Nodes
    this.engineGroup = null;
    this.engineFreq = 60;
    
    this.audioFiles = {
      coin: null,
      crash: null,
      engine: null
    };
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopEngine();
    } else {
      this.startEngine();
    }
    return this.enabled;
  }

  // Realistic synthesized engine
  startEngine() {
    if (!this.enabled || this.engineGroup) return;

    const ctx = this.ctx;
    const group = ctx.createGain();
    group.gain.setValueAtTime(0.06, ctx.currentTime);

    // Layer 1: Core vibration (Low Sawtooth)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(this.engineFreq, ctx.currentTime);

    // Layer 2: Higher harmonics (Square)
    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(this.engineFreq * 0.5, ctx.currentTime);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.3, ctx.currentTime);
    osc2.connect(g2);

    // Layer 3: Exhaust/Air noise
    const noise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;
    noise.loop = true;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(200, ctx.currentTime);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, ctx.currentTime);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    // Filter for the whole engine
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);

    osc1.connect(filter);
    g2.connect(filter);
    noiseGain.connect(filter);
    filter.connect(group);
    group.connect(ctx.destination);

    osc1.start();
    osc2.start();
    noise.start();

    this.engineGroup = { group, osc1, osc2, noiseFilter, filter };
  }

  updateEngine(speed) {
    if (!this.enabled || !this.engineGroup) return;
    const { osc1, osc2, noiseFilter, filter } = this.engineGroup;
    
    const baseFreq = 50 + (speed * 120);
    osc1.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.1);
    osc2.frequency.setTargetAtTime(baseFreq * 0.5, this.ctx.currentTime, 0.1);
    
    // Shift filters with speed
    filter.frequency.setTargetAtTime(400 + (speed * 800), this.ctx.currentTime, 0.1);
    noiseFilter.frequency.setTargetAtTime(200 + (speed * 1000), this.ctx.currentTime, 0.1);
  }

  stopEngine() {
    if (this.engineGroup) {
      this.engineGroup.osc1.stop();
      this.engineGroup.osc2.stop();
      this.engineGroup.group.disconnect();
      this.engineGroup = null;
    }
  }

  playCoin() {
    if (!this.enabled) return;
    this.beep(800, 0.05, 'triangle');
    setTimeout(() => this.beep(1200, 0.1, 'triangle'), 60);
  }

  playCrash() {
    if (!this.enabled) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }

  beep(freq, duration, type = 'sine') {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
}

