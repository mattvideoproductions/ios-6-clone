const STORAGE_KEY = "skeuo-simulator-preferences";

export class SettingsStore {
  constructor() {
    this.settings = {
      soundEnabled: true,
      ...(readStoredSettings()),
    };
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.settings);
    return () => this.listeners.delete(listener);
  }

  setSoundEnabled(enabled) {
    if (this.settings.soundEnabled === enabled) {
      return;
    }

    this.settings = {
      ...this.settings,
      soundEnabled: Boolean(enabled),
    };

    persistSettings(this.settings);
    this.emit();
  }

  emit() {
    for (const listener of this.listeners) {
      listener(this.settings);
    }
  }
}

function readStoredSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to read simulator settings, falling back to defaults.", error);
    return {};
  }
}

function persistSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Failed to persist simulator settings.", error);
  }
}
