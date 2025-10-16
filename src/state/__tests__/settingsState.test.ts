import { describe, expect, it, beforeEach } from 'vitest';
import { initialSettingsState, settingsReducer } from '../settingsReducer';
import { loadSettingsState, persistSettingsState, resetSettingsState } from '../persistence';

describe('settingsReducer', () => {
  it('toggles boolean values without mutating existing state', () => {
    const toggled = settingsReducer(initialSettingsState, { type: 'toggle', path: ['connectivity', 'wifiEnabled'] });

    expect(toggled.connectivity.wifiEnabled).toBe(!initialSettingsState.connectivity.wifiEnabled);
    expect(initialSettingsState.connectivity.wifiEnabled).toBe(true);
    expect(toggled).not.toBe(initialSettingsState);
  });

  it('sets nested schedule values immutably', () => {
    const updated = settingsReducer(initialSettingsState, {
      type: 'set',
      path: ['doNotDisturb', 'schedule', 'start'],
      value: '21:30'
    });

    expect(updated.doNotDisturb.schedule.start).toBe('21:30');
    expect(initialSettingsState.doNotDisturb.schedule.start).toBe('22:00');
  });

  it('casts slider values to numbers', () => {
    const updated = settingsReducer(initialSettingsState, {
      type: 'set',
      path: ['display', 'brightness'],
      value: 40
    });

    expect(updated.display.brightness).toBe(40);
    expect(typeof updated.display.brightness).toBe('number');
  });
});

describe('settings persistence', () => {
  beforeEach(() => {
    resetSettingsState();
    window.localStorage.clear();
  });

  it('stores and retrieves state from localStorage', () => {
    const customState = {
      ...initialSettingsState,
      connectivity: {
        ...initialSettingsState.connectivity,
        wifiNetwork: 'Studio 5G'
      },
      display: {
        ...initialSettingsState.display,
        brightness: 42
      }
    };

    persistSettingsState(customState);
    const loaded = loadSettingsState();

    expect(loaded).toEqual(customState);
  });

  it('returns null when storage contents are malformed', () => {
    window.localStorage.setItem('skeuo-settings-state', '{bad json');
    const loaded = loadSettingsState();

    expect(loaded).toBeNull();
  });
});
