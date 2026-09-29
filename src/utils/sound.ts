// Web Audio API ambient sound generator
class FocusAudioManager {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private currentMode: 'rain' | 'whitenoise' | 'ambient' | 'off' = 'off';

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playSound(mode: 'rain' | 'whitenoise' | 'ambient') {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    this.currentMode = mode;
    this.isPlaying = true;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filters for different ambient atmospheres
    const filter = this.ctx.createBiquadFilter();
    if (mode === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    } else if (mode === 'ambient') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);
    } else {
      // White noise / gentle air
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    }

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.06, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    whiteNoise.start(0);
    this.noiseNode = whiteNoise;
  }

  public playChime() {
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.3); // A5

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.2);
  }

  public stop() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as any).stop?.();
        this.noiseNode.disconnect();
      } catch (e) {}
      this.noiseNode = null;
    }
    this.isPlaying = false;
    this.currentMode = 'off';
  }

  public getMode() {
    return this.currentMode;
  }
}

export const focusAudio = new FocusAudioManager();
