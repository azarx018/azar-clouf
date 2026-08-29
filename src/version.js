// Single source of truth for the version shown in Settings.
// Keep this in sync with package.json's "version" field, and with
// APP_VERSION at the top of public/sw.js (bumping that one is what
// actually forces browsers to drop old cached builds — see sw.js).
export const APP_VERSION = "1.2.0";
