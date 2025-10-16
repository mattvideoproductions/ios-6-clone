const DEFAULT_SOUND_PROFILES = {
  lock: { frequency: 220, type: "triangle", duration: 0.22, gain: 0.28 },
  unlock: { frequency: 494, type: "sine", duration: 0.32, gain: 0.24 },
  tap: { frequency: 660, type: "square", duration: 0.08, gain: 0.18 },
  notification: { frequency: 880, type: "triangle", duration: 0.45, gain: 0.25 },
};

export const AUDIO_FILE_OVERRIDES = {
  // Example: lock: "/assets/audio/lock.ogg"
};

export class SoundManager {
  constructor(store) {
    this.store = store;
    this.audioContext = null;
    this.buffers = new Map();
    this.isEnabled = store?.settings?.soundEnabled ?? true;
    this.unsubscribe = null;
  }

  attach() {
    if (!this.store) return;
    this.unsubscribe = this.store.subscribe((settings) => {
      this.isEnabled = Boolean(settings.soundEnabled);
    });
  }

  detach() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  async play(name) {
    if (!this.isEnabled) {
      return;
    }

    if (AUDIO_FILE_OVERRIDES[name]) {
      await this.playFromFile(name);
      return;
    }

    this.ensureAudioContext();
    if (!this.audioContext) return;

    if (this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn("Unable to resume audio context", error);
      }
    }

    const profile = DEFAULT_SOUND_PROFILES[name];
    if (!profile) {
      console.warn(`Unknown sound cue: ${name}`);
      return;
    }

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = profile.type;
    oscillator.frequency.setValueAtTime(profile.frequency, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(profile.gain, now + 0.01);
    gain.gain.linearRampToValueAtTime(0.0001, now + profile.duration);

    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + profile.duration + 0.02);
  }

  ensureAudioContext() {
    if (this.audioContext || typeof window === "undefined") {
      return;
    }

    try {
      const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextConstructor) {
        console.warn("Web Audio API is not available in this environment.");
        return;
      }

      this.audioContext = new AudioContextConstructor();
    } catch (error) {
      console.warn("Failed to create audio context.", error);
    }
  }

  async playFromFile(name) {
    const url = AUDIO_FILE_OVERRIDES[name];
    if (!url) return;

    this.ensureAudioContext();
    if (!this.audioContext) return;

    if (this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn("Unable to resume audio context", error);
      }
    }

    const buffer = await this.loadBuffer(url);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start();
  }

  async loadBuffer(url) {
    if (this.buffers.has(url)) {
      return this.buffers.get(url);
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.buffers.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn("Failed to load audio asset", url, error);
      return null;
    }
  }
}
