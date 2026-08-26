// Maps AzarCloud API error codes to friendly, user-facing messages.
// Never surface raw backend errors (stack traces, SQL, Telegram details, etc).
const FRIENDLY_MESSAGES = {
  unauthorized: "Please log in again.",
  invalid_credentials: "Incorrect email or password.",
  invalid_input: "Please check your input.",
  invalid_json: "Please check your input.",
  weak_password: "Password must be at least 8 characters.",
  email_exists: "An account with this email already exists.",
  not_found: "The requested item could not be found.",
  folder_not_empty: "This folder isn't empty.",
  already_exists: "An item with this name already exists.",
  file_too_large: "This file is too large.",
  storage_unavailable: "Storage is temporarily unavailable.",
  database_error: "Something went wrong. Please try again.",
  internal_error: "Something went wrong. Please try again.",
  network_error: "Couldn't reach AzarCloud. Check your connection.",
};

/**
 * Returns a friendly message for any error thrown by ApiClient/CloudService.
 * Falls back to a generic message rather than ever showing raw backend detail.
 */
export function getFriendlyErrorMessage(error) {
  const code = error?.code;
  return FRIENDLY_MESSAGES[code] || "Something went wrong. Please try again.";
}
