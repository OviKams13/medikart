// Entry point of `@medikart/shared/eslint`. In an app:
//
//   import { datetimeRestrictions } from '@medikart/shared/eslint';
//   export default [...yourConfig, ...datetimeRestrictions()];
export {
  DATETIME_MODULE_FILES,
  datetimeModuleExemption,
  datetimeRestrictedImports,
  datetimeRestrictedSyntax,
  datetimeRestrictions,
} from './datetime-restrictions.mjs';
