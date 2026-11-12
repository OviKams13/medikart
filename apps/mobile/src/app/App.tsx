import { formatTime, type ErrorCode } from '@medikart/shared';
import { StatusBar, StyleSheet, Text, View } from 'react-native';

// 4.16 proof that Metro resolves @medikart/shared from the monorepo (runtime import of the
// datetime module, type import of the generated API types). Replaced by the real shell in 4.21.
const CHECK_INSTANT = '2026-10-02T12:30:00Z';
const SAMPLE_ERROR: ErrorCode = 'SLOT_TAKEN';

function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Medikart</Text>
        <Text>
          {CHECK_INSTANT} ={' '}
          {formatTime(CHECK_INSTANT, { locale: 'en', timeZone: 'Africa/Lubumbashi' })}
        </Text>
        <Text>{SAMPLE_ERROR}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '600' },
});

export default App;
