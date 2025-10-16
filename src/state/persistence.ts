import { SettingsState } from './settingsReducer';

const STORAGE_KEY = 'skeuo-settings-state';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const loadSettingsState = (): SettingsState | null => {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as SettingsState;
    return parsed;
  } catch (error) {
    console.warn('Failed to parse settings from storage', error);
    return null;
  }
};

export const persistSettingsState = (state: SettingsState): void => {
  if (!isBrowser()) {
    return;
  }

  try {
    const serialized = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.warn('Failed to persist settings to storage', error);
  }
};

export const resetSettingsState = (): void => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};
