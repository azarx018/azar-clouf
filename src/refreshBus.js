// Tiny pub/sub so actions taken outside a page (e.g. "New folder" in the
// top-level "more options" menu) can tell whichever page is currently
// mounted to refresh its data, without lifting all page state into App.jsx.
const EVENT_NAME = "azarcloud:data-changed";

export function emitDataChanged() {
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function onDataChanged(callback) {
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
}
