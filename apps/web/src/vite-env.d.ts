/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend address for hosted builds (no trailing slash). Empty in development: Vite proxies /api. */
  readonly VITE_API_BASE_URL?: string;
}
