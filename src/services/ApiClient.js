import { API_BASE_URL, SESSION_STORAGE_KEY } from "../config.js";

/**
 * Thrown for any failed API call. `code` matches the backend's error.code
 * (see worker.js errorResponse) when available, otherwise "network_error".
 */
export class ApiError extends Error {
  constructor(code, message, status) {
    super(message || code);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

// Dispatched whenever a protected request comes back 401, so the app can
// clear auth state and show the Login screen from anywhere (see AuthContext.jsx).
const UNAUTHORIZED_EVENT = "azarcloud:unauthorized";

function getToken() {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function clearToken() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}

async function parseErrorBody(response) {
  try {
    const body = await response.json();
    if (body?.error?.code) {
      return new ApiError(body.error.code, body.error.message, response.status);
    }
  } catch {
    // response wasn't JSON — fall through to a generic error
  }
  return new ApiError("internal_error", "An internal server error occurred", response.status);
}

/**
 * Centralized fetch wrapper for every AzarCloud API call.
 *
 * - Automatically attaches `Authorization: Bearer <token>` when a session exists.
 * - Never sets Content-Type when the body is FormData (browser sets the
 *   multipart boundary automatically).
 * - Parses JSON responses; returns null for 204 No Content.
 * - On 401: clears the session and notifies the app so it can show Login.
 */
export async function apiFetch(path, { method = "GET", body, headers = {}, ...rest } = {}) {
  const finalHeaders = { ...headers };
  const token = getToken();
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isFormData && finalHeaders["Content-Type"] === undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    });
  } catch {
    throw new ApiError("network_error", "Couldn't reach AzarCloud", 0);
  }

  if (response.status === 401) {
    clearToken();
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    throw new ApiError("unauthorized", "Authentication required", 401);
  }

  if (!response.ok) {
    throw await parseErrorBody(response);
  }

  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Like apiFetch, but for endpoints that return a raw file body (downloads)
 * instead of JSON. Returns { blob, filename }.
 */
export async function apiFetchBlob(path) {
  const finalHeaders = {};
  const token = getToken();
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { headers: finalHeaders });
  } catch {
    throw new ApiError("network_error", "Couldn't reach AzarCloud", 0);
  }

  if (response.status === 401) {
    clearToken();
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    throw new ApiError("unauthorized", "Authentication required", 401);
  }

  if (!response.ok) {
    throw await parseErrorBody(response);
  }

  const disposition = response.headers.get("Content-Disposition") || "";

let filename = null;

// RFC 5987 / RFC 6266: filename*=UTF-8''...
const filenameStar = disposition.match(/filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i);

if (filenameStar) {
  try {
    filename = decodeURIComponent(filenameStar[1].trim().replace(/^"(.*)"$/, "$1"));
  } catch {
    filename = filenameStar[1].trim().replace(/^"(.*)"$/, "$1");
  }
}

// Standard filename="..."
if (!filename) {
  const filenameMatch = disposition.match(/filename\s*=\s*"([^"]+)"/i);
  if (filenameMatch) {
    filename = filenameMatch[1];
  }
}

// Standard filename=without-quotes
if (!filename) {
  const filenameMatch = disposition.match(/filename\s*=\s*([^;]+)/i);
  if (filenameMatch) {
    filename = filenameMatch[1].trim();
  }
}

filename = filename || "download";
  const blob = await response.blob();
  return { blob, filename };
}

export const AUTH_EVENTS = { UNAUTHORIZED: UNAUTHORIZED_EVENT };
