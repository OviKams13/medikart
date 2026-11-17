import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initI18n } from '../i18n';
import { AppProviders } from './AppProviders';
import { AppShell } from './AppShell';
import { createAppServices } from './services';

// Language = the phone's, French as fallback. Initialized before the first render (4.20).
const i18n = initI18n();
// Store, HTTP client, clock and query cache: built once for the whole app (4.22, 4.23).
const services = createAppServices();

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <AppProviders services={services}>
          <AppShell />
        </AppProviders>
      </SafeAreaProvider>
    </I18nextProvider>
  );
}

export default App;
