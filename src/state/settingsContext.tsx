import React, { useEffect, useReducer } from 'react';
import { initialSettingsState, SettingsAction, SettingsState, settingsReducer } from './settingsReducer';
import { loadSettingsState, persistSettingsState } from './persistence';

const SettingsStateContext = React.createContext<SettingsState | undefined>(undefined);
const SettingsDispatchContext = React.createContext<React.Dispatch<SettingsAction> | undefined>(undefined);

const initSettingsState = (): SettingsState => {
  const stored = loadSettingsState();
  return stored ?? initialSettingsState;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialSettingsState, initSettingsState);

  useEffect(() => {
    persistSettingsState(state);
  }, [state]);

  useEffect(() => {
    document.documentElement.style.setProperty('--simulator-brightness', (state.display.brightness / 100).toString());
    document.body.dataset.sounds = state.sounds.enabled ? 'on' : 'off';
    document.body.dataset.dnd = state.doNotDisturb.enabled ? 'on' : 'off';
  }, [state.display.brightness, state.sounds.enabled, state.doNotDisturb.enabled]);

  return (
    <SettingsStateContext.Provider value={state}>
      <SettingsDispatchContext.Provider value={dispatch}>{children}</SettingsDispatchContext.Provider>
    </SettingsStateContext.Provider>
  );
};

export const useSettings = (): SettingsState => {
  const context = React.useContext(SettingsStateContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const useSettingsDispatch = (): React.Dispatch<SettingsAction> => {
  const context = React.useContext(SettingsDispatchContext);
  if (!context) {
    throw new Error('useSettingsDispatch must be used within a SettingsProvider');
  }
  return context;
};
