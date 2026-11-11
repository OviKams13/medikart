// The ONLY place where dayjs is configured. Nothing outside this folder may import dayjs
// (enforced by the ESLint rule of 4.14, see packages/shared/eslint).
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
// Importing a dayjs locale only registers it; it does not change the global locale.
import 'dayjs/locale/fr.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export default dayjs;
export type { Dayjs } from 'dayjs';
