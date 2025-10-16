import { Fragment, useState } from 'react';
import clsx from 'clsx';
import GroupedList from './GroupedList';
import ToggleCell from './ToggleCell';
import DisclosureCell from './DisclosureCell';
import SliderCell from './SliderCell';
import SearchBar from './SearchBar';
import { useSettings, useSettingsDispatch } from '../state/settingsContext';
import type { AutoLockOption, ShowPreviewOption } from '../state/settingsReducer';

import '../styles/settings-shell.css';

type ScreenKey =
  | 'root'
  | 'wifi'
  | 'notifications'
  | 'sounds'
  | 'display'
  | 'general'
  | 'doNotDisturb';

type StackEntry = {
  key: ScreenKey;
  id: number;
};

let stackCounter = 0;

const screenTitles: Record<ScreenKey, string> = {
  root: 'Settings',
  wifi: 'Wi-Fi',
  notifications: 'Notifications',
  sounds: 'Sounds',
  display: 'Display & Brightness',
  general: 'General',
  doNotDisturb: 'Do Not Disturb'
};

const previewLabel: Record<ShowPreviewOption, string> = {
  always: 'Always',
  'when-unlocked': 'When Unlocked',
  never: 'Never'
};

const autoLockLabels: Record<AutoLockOption, string> = {
  '1-minute': '1 Minute',
  '2-minutes': '2 Minutes',
  '5-minutes': '5 Minutes',
  never: 'Never'
};

const SettingsShell = () => {
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const [stack, setStack] = useState<StackEntry[]>([{ key: 'root', id: stackCounter += 1 }]);
  const [searchTerm, setSearchTerm] = useState('');

  const current = stack[stack.length - 1];
  const isRoot = current.key === 'root';

  const pushScreen = (key: ScreenKey) => {
    setStack((prev) => [...prev, { key, id: (stackCounter += 1) }]);
  };

  const popScreen = () => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const normalizedTerm = searchTerm.trim().toLowerCase();

  const rootSections = [
    {
      title: 'Connectivity',
      items: [
        {
          key: 'airplane-mode',
          keywords: ['airplane mode', 'flight', 'offline'],
          node: (
            <ToggleCell
              label="Airplane Mode"
              value={settings.connectivity.airplaneMode}
              onChange={() => dispatch({ type: 'toggle', path: ['connectivity', 'airplaneMode'] })}
            />
          )
        },
        {
          key: 'wifi',
          keywords: ['wifi', 'network', 'internet'],
          node: (
            <DisclosureCell
              label="Wi-Fi"
              detail={settings.connectivity.wifiEnabled ? settings.connectivity.wifiNetwork : 'Off'}
              onClick={() => pushScreen('wifi')}
            />
          )
        },
        {
          key: 'bluetooth',
          keywords: ['bluetooth', 'devices'],
          node: (
            <ToggleCell
              label="Bluetooth"
              value={settings.connectivity.bluetoothEnabled}
              detail={settings.connectivity.bluetoothEnabled ? 'On' : 'Off'}
              onChange={() => dispatch({ type: 'toggle', path: ['connectivity', 'bluetoothEnabled'] })}
            />
          )
        }
      ]
    },
    {
      title: 'Notifications & Sounds',
      items: [
        {
          key: 'notifications',
          keywords: ['notifications', 'alerts'],
          node: (
            <DisclosureCell
              label="Notifications"
              detail={settings.notifications.enabled ? 'On' : 'Off'}
              onClick={() => pushScreen('notifications')}
            />
          )
        },
        {
          key: 'sounds',
          keywords: ['sounds', 'volume', 'audio'],
          node: (
            <DisclosureCell
              label="Sounds"
              detail={`${settings.sounds.volume}%`}
              onClick={() => pushScreen('sounds')}
            />
          )
        },
        {
          key: 'dnd',
          keywords: ['do not disturb', 'focus', 'quiet'],
          node: (
            <DisclosureCell
              label="Do Not Disturb"
              detail={settings.doNotDisturb.enabled ? 'On' : 'Off'}
              onClick={() => pushScreen('doNotDisturb')}
            />
          )
        }
      ]
    },
    {
      title: 'General',
      items: [
        {
          key: 'display',
          keywords: ['display', 'brightness', 'text size'],
          node: (
            <DisclosureCell
              label="Display & Brightness"
              detail={`${settings.display.brightness}%`}
              onClick={() => pushScreen('display')}
            />
          )
        },
        {
          key: 'general',
          keywords: ['general', 'background refresh', 'date', 'keyboard'],
          node: (
            <DisclosureCell label="General" onClick={() => pushScreen('general')} />
          )
        }
      ]
    }
  ];

  const filteredRootSections = !normalizedTerm
    ? rootSections
    : rootSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) =>
            item.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedTerm)) ||
            item.key.toLowerCase().includes(normalizedTerm)
          )
        }))
        .filter((section) => section.items.length > 0);

  const renderWifiScreen = () => {
    const networks = ['Home Wi-Fi', 'Studio 5G', 'CoffeeShop', 'Airport Free'];
    return (
      <div className="settings-panel__body">
        <GroupedList>
          <ToggleCell
            label="Wi-Fi"
            value={settings.connectivity.wifiEnabled}
            onChange={() => dispatch({ type: 'toggle', path: ['connectivity', 'wifiEnabled'] })}
          />
        </GroupedList>
        <GroupedList title="Choose a Network">
          {networks.map((network) => (
            <button
              type="button"
              key={network}
              className={clsx('cell', 'cell--disclosure', 'cell--network',
                settings.connectivity.wifiNetwork === network && settings.connectivity.wifiEnabled && 'cell--selected')}
              onClick={() => {
                dispatch({ type: 'set', path: ['connectivity', 'wifiNetwork'], value: network });
                if (!settings.connectivity.wifiEnabled) {
                  dispatch({ type: 'toggle', path: ['connectivity', 'wifiEnabled'] });
                }
              }}
            >
              <div className="cell__label">
                <span className="cell__title">{network}</span>
              </div>
              {settings.connectivity.wifiNetwork === network && settings.connectivity.wifiEnabled ? (
                <span className="cell__checkmark" aria-hidden>
                  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 7L7 12L16 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              ) : null}
            </button>
          ))}
        </GroupedList>
      </div>
    );
  };

  const renderNotificationsScreen = () => {
    return (
      <div className="settings-panel__body">
        <GroupedList>
          <ToggleCell
            label="Allow Notifications"
            value={settings.notifications.enabled}
            onChange={() => dispatch({ type: 'toggle', path: ['notifications', 'enabled'] })}
          />
        </GroupedList>
        <GroupedList title="Show Previews" footer="Choose how notification previews appear when the device is locked.">
          {(['always', 'when-unlocked', 'never'] as ShowPreviewOption[]).map((option) => (
            <button
              type="button"
              key={option}
              className={clsx('cell', 'cell--disclosure', settings.notifications.showPreviews === option && 'cell--selected')}
              onClick={() => dispatch({ type: 'set', path: ['notifications', 'showPreviews'], value: option })}
            >
              <div className="cell__label">
                <span className="cell__title">{previewLabel[option]}</span>
              </div>
              {settings.notifications.showPreviews === option ? (
                <span className="cell__checkmark" aria-hidden>
                  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 7L7 12L16 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              ) : null}
            </button>
          ))}
        </GroupedList>
      </div>
    );
  };

  const renderSoundsScreen = () => {
    return (
      <div className="settings-panel__body">
        <GroupedList>
          <ToggleCell
            label="Sound Effects"
            value={settings.sounds.enabled}
            onChange={() => dispatch({ type: 'toggle', path: ['sounds', 'enabled'] })}
          />
          <ToggleCell
            label="Vibrate on Ring"
            value={settings.sounds.vibrateOnRing}
            onChange={() => dispatch({ type: 'toggle', path: ['sounds', 'vibrateOnRing'] })}
          />
          <ToggleCell
            label="Vibrate on Silent"
            value={settings.sounds.vibrateOnSilent}
            onChange={() => dispatch({ type: 'toggle', path: ['sounds', 'vibrateOnSilent'] })}
          />
        </GroupedList>
        <GroupedList title="Volume">
          <SliderCell
            label="Ringer and Alerts"
            value={settings.sounds.volume}
            onChange={(value) => dispatch({ type: 'set', path: ['sounds', 'volume'], value })}
            formatter={(value) => `${value}%`}
          />
        </GroupedList>
      </div>
    );
  };

  const renderDisplayScreen = () => {
    return (
      <div className="settings-panel__body">
        <GroupedList title="Brightness">
          <SliderCell
            label="Brightness"
            value={settings.display.brightness}
            onChange={(value) => dispatch({ type: 'set', path: ['display', 'brightness'], value })}
            formatter={(value) => `${value}%`}
          />
          <ToggleCell
            label="Night Shift"
            value={settings.display.nightShift}
            onChange={() => dispatch({ type: 'toggle', path: ['display', 'nightShift'] })}
          />
        </GroupedList>
        <GroupedList title="Text Size">
          <SliderCell
            label="Dynamic Type"
            value={settings.display.textSize}
            onChange={(value) => dispatch({ type: 'set', path: ['display', 'textSize'], value })}
            formatter={(value) => `${value}%`}
          />
        </GroupedList>
        <GroupedList title="Auto-Lock">
          {(['1-minute', '2-minutes', '5-minutes', 'never'] as const).map((option) => (
            <button
              type="button"
              key={option}
              className={clsx('cell', 'cell--disclosure', settings.display.autoLock === option && 'cell--selected')}
              onClick={() => dispatch({ type: 'set', path: ['display', 'autoLock'], value: option })}
            >
              <div className="cell__label">
                <span className="cell__title">{autoLockLabels[option]}</span>
              </div>
              {settings.display.autoLock === option ? (
                <span className="cell__checkmark" aria-hidden>
                  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 7L7 12L16 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              ) : null}
            </button>
          ))}
        </GroupedList>
      </div>
    );
  };

  const renderGeneralScreen = () => {
    return (
      <div className="settings-panel__body">
        <GroupedList title="System">
          <ToggleCell
            label="Background App Refresh"
            value={settings.general.backgroundAppRefresh}
            onChange={() => dispatch({ type: 'toggle', path: ['general', 'backgroundAppRefresh'] })}
          />
          <ToggleCell
            label="Set Automatically"
            value={settings.general.dateTimeAutomatic}
            onChange={() => dispatch({ type: 'toggle', path: ['general', 'dateTimeAutomatic'] })}
          />
          <ToggleCell
            label="Keyboard Clicks"
            value={settings.general.keyboardClicks}
            onChange={() => dispatch({ type: 'toggle', path: ['general', 'keyboardClicks'] })}
          />
        </GroupedList>
      </div>
    );
  };

  const renderDoNotDisturbScreen = () => {
    return (
      <div className="settings-panel__body">
        <GroupedList>
          <ToggleCell
            label="Scheduled"
            value={settings.doNotDisturb.enabled}
            onChange={() => dispatch({ type: 'toggle', path: ['doNotDisturb', 'enabled'] })}
          />
        </GroupedList>
        <GroupedList title="Schedule">
          {(['start', 'end'] as const).map((boundary) => (
            <div key={boundary} className="cell cell--input">
              <label className="cell__label" htmlFor={`dnd-${boundary}`}>
                <span className="cell__title">{boundary === 'start' ? 'From' : 'To'}</span>
              </label>
              <input
                id={`dnd-${boundary}`}
                type="time"
                className="cell__time-input"
                value={settings.doNotDisturb.schedule[boundary]}
                onChange={(event) =>
                  dispatch({ type: 'set', path: ['doNotDisturb', 'schedule', boundary], value: event.target.value })
                }
              />
            </div>
          ))}
        </GroupedList>
      </div>
    );
  };

  const renderRootScreen = () => {
    return (
      <div className="settings-panel__body">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search Settings" />
        {filteredRootSections.length > 0 ? (
          filteredRootSections.map((section) => (
            <GroupedList key={section.title} title={section.title}>
              {section.items.map((item) => (
                <Fragment key={item.key}>{item.node}</Fragment>
              ))}
            </GroupedList>
          ))
        ) : (
          <div className="settings-panel__empty">
            <p>No matches found for “{searchTerm}”.</p>
          </div>
        )}
      </div>
    );
  };

  const renderScreen = (key: ScreenKey) => {
    switch (key) {
      case 'root':
        return renderRootScreen();
      case 'wifi':
        return renderWifiScreen();
      case 'notifications':
        return renderNotificationsScreen();
      case 'sounds':
        return renderSoundsScreen();
      case 'display':
        return renderDisplayScreen();
      case 'general':
        return renderGeneralScreen();
      case 'doNotDisturb':
        return renderDoNotDisturbScreen();
      default:
        return null;
    }
  };

  return (
    <div className="settings-shell">
      <div className="settings-shell__chrome">
        <div className="settings-shell__status-bar">
          <span className="status-bar__carrier">CTO</span>
          <span className="status-bar__time">9:41 AM</span>
          <span className="status-bar__icons">
            <span className="status-bar__icon status-bar__icon--signal" />
            <span className="status-bar__icon status-bar__icon--wifi" />
            <span className={clsx('status-bar__icon', 'status-bar__icon--battery', !settings.sounds.enabled && 'status-bar__icon--muted')} />
          </span>
        </div>
        <div className="settings-shell__content">
          <header className="settings-shell__header">
            {!isRoot ? (
              <button type="button" className="header__back" onClick={popScreen}>
                <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18L2 10L10 2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Back</span>
              </button>
            ) : (
              <span className="header__spacer" />
            )}
            <div className="header__title">{screenTitles[current.key]}</div>
            <span className="header__spacer" />
          </header>
          <div className="settings-shell__panels" style={{ transform: `translateX(-${(stack.length - 1) * 100}%)` }}>
            {stack.map((entry, index) => (
              <div className="settings-panel" key={`${entry.key}-${entry.id}-${index}`}>
                {renderScreen(entry.key)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsShell;
