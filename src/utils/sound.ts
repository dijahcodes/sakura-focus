// Web Audio API based sound synthesizer for pristine offline Mac audio effects
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Gentle pleasant chime when a Pomodoro or Break finishes
export function playCompletionChime(volume = 0.5) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // 3 harmonic notes: A5 (880Hz), C#6 (1108Hz), E6 (1318Hz)
    const notes = [880, 1108.73, 1318.51];
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      
      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(volume * 0.4, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.3);
    });
  } catch (e) {
    console.warn('Audio playback error:', e);
  }
}

// Warm Mac "pop" sound when completing a task checkbox
export function playTaskPop(volume = 0.4) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.08);
    
    gain.gain.setValueAtTime(volume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.16);
  } catch (e) {
    console.warn('Task pop audio error:', e);
  }
}

// Soft tactile click for button presses
export function playClickSound(volume = 0.2) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
    
    gain.gain.setValueAtTime(volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.06);
  } catch (e) {
    // ignore
  }
}

// Ambient Background Sound Engine
class AmbientEngine {
  private activeType: string = 'none';
  private gainNode: GainNode | null = null;
  private sourceNodes: AudioNode[] = [];
  private volume: number = 0.3;

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && audioCtx) {
      this.gainNode.gain.setTargetAtTime(this.volume * 0.25, audioCtx.currentTime, 0.1);
    }
  }

  stop() {
    this.sourceNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch (e) {
        // ignore
      }
    });
    this.sourceNodes = [];
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch (e) {
        // ignore
      }
      this.gainNode = null;
    }
    this.activeType = 'none';
  }

  play(type: 'none' | 'pinkNoise' | 'rain' | 'lofiChords') {
    if (this.activeType === type) return;
    this.stop();
    if (type === 'none') return;

    try {
      const ctx = getAudioContext();
      this.activeType = type;
      this.gainNode = ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
      this.gainNode.connect(ctx.destination);

      if (type === 'pinkNoise' || type === 'rain') {
        // Generate procedural noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Pink noise filter approximation
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
          b6 = white * 0.115926;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        if (type === 'rain') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1100, ctx.currentTime);
        } else {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, ctx.currentTime);
        }

        noise.connect(filter);
        filter.connect(this.gainNode);
        noise.start();
        this.sourceNodes.push(noise, filter);

      } else if (type === 'lofiChords') {
        // Soothing warm chord pad: Db maj7 / Gb maj7 chord
        const freqs = [138.59, 174.61, 207.65, 261.63, 329.63];
        freqs.forEach((f) => {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(380, ctx.currentTime);
          
          osc.connect(filter);
          filter.connect(this.gainNode!);
          osc.start();
          this.sourceNodes.push(osc, filter);
        });
      }
    } catch (e) {
      console.warn('Ambient engine error:', e);
    }
  }

  getCurrentType(): string {
    return this.activeType;
  }
}

export const ambientEngine = new AmbientEngine();
