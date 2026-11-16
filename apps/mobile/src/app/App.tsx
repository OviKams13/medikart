import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import { initI18n } from '../i18n';
import { DevGallery } from './DevGallery';

// Language = the phone's, French as fallback. Initialized before the first render (4.20).
const i18n = initI18n();

// The real shell (navigation 4.21, Redux and React Query 4.22) replaces the gallery later.
function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <DevGallery />
      </SafeAreaProvider>
    </I18nextProvider>
  );
}

export default App;
