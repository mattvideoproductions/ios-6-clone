import SettingsShell from './components/SettingsShell';
import { SettingsProvider } from './state/settingsContext';

const App = () => {
  return (
    <SettingsProvider>
      <SettingsShell />
    </SettingsProvider>
  );
};

export default App;
