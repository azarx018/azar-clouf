// Central configuration for talking to the AzarCloud backend.
// Do not hardcode this URL anywhere else in the app — import it from here.
export const API_BASE_URL = "https://azarcloud.zharr188.workers.dev";

// Key used to persist the session token in localStorage.
export const SESSION_STORAGE_KEY = "azarcloud_session";

// Matches the backend's MAX_UPLOAD_SIZE (worker.js), used only for
// instant client-side UX feedback. The backend remains authoritative.
export const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;
