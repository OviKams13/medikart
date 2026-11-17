import { useErrorMessage, useTranslation } from '../i18n';
import { ApiClientError } from './errors';

/**
 * Turns any error into the text to show: the translated message of the error `code`, a
 * "no connection" text for network failures and timeouts, a generic text otherwise. The server
 * `message` is never shown (report §10.1).
 */
export function useApiErrorMessage(): (error: unknown) => string {
  const { t } = useTranslation();
  const errorMessage = useErrorMessage();
  return (error) => {
    if (error instanceof ApiClientError) {
      if (error.kind === 'network' || error.kind === 'timeout') {
        return t('errorsFallback.network');
      }
      return errorMessage(error.code);
    }
    return t('errorsFallback.unknown');
  };
}
