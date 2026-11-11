// D1.5-01: all dates and times go through the `datetime` module of @medikart/shared.
// This flat-config block forbids every other way to format or build a date for display.
// It is made of ESLint's own rules (no custom rule code to maintain) and is reused as is by
// the mobile app and the web dashboard.

const USE_MODULE = "Use the 'datetime' module of @medikart/shared instead (D1.5-01).";

const FORBIDDEN_LIBRARIES = [
  'dayjs',
  'moment',
  'moment-timezone',
  'luxon',
  'date-fns',
  'date-fns-tz',
];

const FORBIDDEN_DATE_METHODS = [
  'toLocaleDateString',
  'toLocaleTimeString',
  'toLocaleString',
  'toISOString',
  'toDateString',
  'toTimeString',
  'toUTCString',
  'toGMTString',
];

const MANUAL_FORMATTING_METHOD =
  /^(get|set)(UTC)?(FullYear|Month|Date|Day|Hours|Minutes|Seconds|Milliseconds)$/;

/** Files of the datetime module itself: the only place allowed to do this work. */
export const DATETIME_MODULE_FILES = ['src/datetime/**'];

export const datetimeRestrictedImports = {
  paths: FORBIDDEN_LIBRARIES.map((name) => ({
    name,
    message: `Importing '${name}' is forbidden outside the datetime module. ${USE_MODULE}`,
  })),
  patterns: [
    {
      group: FORBIDDEN_LIBRARIES.map((name) => `${name}/*`),
      message: `Date libraries are forbidden outside the datetime module. ${USE_MODULE}`,
    },
  ],
};

export const datetimeRestrictedSyntax = [
  {
    selector: `CallExpression[callee.property.name=/^(${FORBIDDEN_DATE_METHODS.join('|')})$/]`,
    message: `Formatting a date with a Date method is forbidden. ${USE_MODULE} (Numbers: never use toLocaleString either.)`,
  },
  {
    selector: `CallExpression[callee.property.name=/${MANUAL_FORMATTING_METHOD.source}/]`,
    message: `Building a date text by hand from Date getters/setters is forbidden. ${USE_MODULE}`,
  },
  {
    selector:
      ":matches(NewExpression, CallExpression)[callee.object.name='Intl'][callee.property.name=/^(DateTimeFormat|RelativeTimeFormat)$/]",
    message: `Intl date formatting is forbidden. ${USE_MODULE}`,
  },
];

/**
 * Flat-config blocks that forbid date formatting. Add them AFTER your own rules.
 * `files` defaults to every JS/TS file; the datetime module itself is exempted by
 * `datetimeModuleExemption` (only needed in the package that contains the module).
 */
export function datetimeRestrictions({ files = ['**/*.{js,jsx,mjs,cjs,ts,tsx}'] } = {}) {
  return [
    {
      name: 'medikart/datetime-restrictions',
      files,
      rules: {
        'no-restricted-imports': ['error', datetimeRestrictedImports],
        'no-restricted-syntax': ['error', ...datetimeRestrictedSyntax],
      },
    },
  ];
}

/** Turns the restrictions off inside the datetime module (and only there). */
export const datetimeModuleExemption = {
  name: 'medikart/datetime-module-exemption',
  files: DATETIME_MODULE_FILES,
  rules: {
    'no-restricted-imports': 'off',
    'no-restricted-syntax': 'off',
  },
};
