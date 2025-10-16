export type ShowPreviewOption = 'always' | 'when-unlocked' | 'never';
export type AutoLockOption = '1-minute' | '2-minutes' | '5-minutes' | 'never';

export type SettingsState = {
  connectivity: {
    wifiEnabled: boolean;
    wifiNetwork: string;
    bluetoothEnabled: boolean;
    airplaneMode: boolean;
  };
  notifications: {
    enabled: boolean;
    showPreviews: ShowPreviewOption;
  };
  sounds: {
    enabled: boolean;
    vibrateOnRing: boolean;
    vibrateOnSilent: boolean;
    volume: number; // 0 - 100
  };
  display: {
    brightness: number; // 0 - 100
    nightShift: boolean;
    textSize: number; // 0 - 100
    autoLock: AutoLockOption;
  };
  general: {
    backgroundAppRefresh: boolean;
    dateTimeAutomatic: boolean;
    keyboardClicks: boolean;
  };
  doNotDisturb: {
    enabled: boolean;
    schedule: {
      start: string;
      end: string;
    };
  };
};

export const initialSettingsState: SettingsState = {
  connectivity: {
    wifiEnabled: true,
    wifiNetwork: 'Home Wi-Fi',
    bluetoothEnabled: true,
    airplaneMode: false
  },
  notifications: {
    enabled: true,
    showPreviews: 'when-unlocked'
  },
  sounds: {
    enabled: true,
    vibrateOnRing: true,
    vibrateOnSilent: false,
    volume: 65
  },
  display: {
    brightness: 75,
    nightShift: false,
    textSize: 55,
    autoLock: '2-minutes'
  },
  general: {
    backgroundAppRefresh: true,
    dateTimeAutomatic: true,
    keyboardClicks: true
  },
  doNotDisturb: {
    enabled: false,
    schedule: {
      start: '22:00',
      end: '07:00'
    }
  }
};

type TogglePath =
  | ['connectivity', 'wifiEnabled']
  | ['connectivity', 'bluetoothEnabled']
  | ['connectivity', 'airplaneMode']
  | ['notifications', 'enabled']
  | ['sounds', 'enabled']
  | ['sounds', 'vibrateOnRing']
  | ['sounds', 'vibrateOnSilent']
  | ['display', 'nightShift']
  | ['general', 'backgroundAppRefresh']
  | ['general', 'dateTimeAutomatic']
  | ['general', 'keyboardClicks']
  | ['doNotDisturb', 'enabled'];

type SettablePath =
  | ['connectivity', 'wifiNetwork']
  | ['notifications', 'showPreviews']
  | ['sounds', 'volume']
  | ['display', 'brightness']
  | ['display', 'textSize']
  | ['display', 'autoLock']
  | ['doNotDisturb', 'schedule', 'start']
  | ['doNotDisturb', 'schedule', 'end'];

export type SettingsAction =
  | { type: 'toggle'; path: TogglePath }
  | { type: 'set'; path: SettablePath; value: string | number }
  | { type: 'hydrate'; state: SettingsState };

const toggleReducer = (state: SettingsState, [section, key]: TogglePath): SettingsState => {
  const sectionState = state[section] as Record<string, boolean>;

  return {
    ...state,
    [section]: {
      ...state[section],
      [key]: !sectionState[key]
    }
  } as SettingsState;
};

const setNestedValue = (state: SettingsState, path: SettablePath, value: string | number): SettingsState => {
  if (path.length === 2) {
    const [section, key] = path;
    return {
      ...state,
      [section]: {
        ...state[section],
        [key]: value
      }
    } as SettingsState;
  }

  const [section, nestedKey, leafKey] = path;
  return {
    ...state,
    [section]: {
      ...state[section],
      [nestedKey]: {
        ...(state[section] as any)[nestedKey],
        [leafKey]: value
      }
    }
  } as SettingsState;
};

export const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'toggle':
      return toggleReducer(state, action.path);
    case 'set': {
      const value = action.path[1] === 'volume' || action.path[1] === 'brightness' || action.path[1] === 'textSize'
        ? Number(action.value)
        : action.value;
      return setNestedValue(state, action.path, value);
    }
    default:
      return state;
  }
};
