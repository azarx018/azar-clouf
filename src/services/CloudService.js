import { apiFetch, apiFetchBlob, AUTH_EVENTS } from "./ApiClient.js";
import { API_BASE_URL, SESSION_STORAGE_KEY } from "../config.js";

function triggerBrowserDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * CloudService is the ONLY module allowed to know how AzarCloud's data
 * is fetched. Pages/components call these methods and never touch the
 * API, fetch(), or apiFetch() directly.
 *
 * PWA UI -> CloudService -> ApiClient -> AzarCloud Worker API -> D1 + Telegram
 *
 * The frontend never holds Telegram tokens, channel IDs, or any backend
 * secret; CloudService only speaks in File/Folder terms, matching the
 * existing (tested) backend contract exactly.
 */
export const CloudService = {
  async getStorageOverview() {
    return apiFetch("/api/storage");
  },

  async getSubfolders(parentId = "root") {
    // Backend already returns fileCount per folder — no client-side calc needed.
    return apiFetch(`/api/folders?parent=${encodeURIComponent(parentId)}`);
  },

  async getFolder(id) {
    return apiFetch(`/api/folders/${encodeURIComponent(id)}`);
  },

  async getBreadcrumb(id) {
    return apiFetch(`/api/folders/${encodeURIComponent(id)}/breadcrumb`);
  },

  async getFiles(folderId = "root") {
    return apiFetch(`/api/files?folder=${encodeURIComponent(folderId)}`);
  },

  async getFile(id) {
    return apiFetch(`/api/files/${encodeURIComponent(id)}`);
  },

  async searchFiles(query) {
    return apiFetch(`/api/search?q=${encodeURIComponent(query)}`);
  },

  async getFavorites() {
    return apiFetch("/api/favorites");
  },

  async addFavorite(id) {
    await apiFetch(`/api/files/${encodeURIComponent(id)}/favorite`, { method: "POST" });
    return { id, favorite: true };
  },

  async removeFavorite(id) {
    await apiFetch(`/api/files/${encodeURIComponent(id)}/favorite`, { method: "DELETE" });
    return { id, favorite: false };
  },

  async getTrash() {
    return apiFetch("/api/trash");
  },

  async uploadFile(file, { folderId = "root", onProgress, signal } = {}) {
    // Uses XHR (not fetch) so we can report real upload progress, which
    // fetch() cannot do for request bodies. Content-Type is left for the
    // browser to set (with the multipart boundary) — never set manually.
    const token = localStorage.getItem(SESSION_STORAGE_KEY);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderId", folderId);

    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject({ code: "cancelled", message: "Upload cancelled" });
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/api/upload`);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.(e.loaded / e.total);
      };

      xhr.onload = () => {
        let body = null;
        try {
          body = JSON.parse(xhr.responseText);
        } catch {
          // ignore
        }

        if (xhr.status === 401) {
          localStorage.removeItem(SESSION_STORAGE_KEY);
          window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));
          reject({ code: "unauthorized", message: "Authentication required" });
          return;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(1);
          resolve(body);
        } else {
          reject(body?.error || { code: "internal_error", message: "Upload failed" });
        }
      };

      xhr.onerror = () => reject({ code: "network_error", message: "Couldn't reach AzarCloud" });
      xhr.onabort = () => reject({ code: "cancelled", message: "Upload cancelled" });

      if (signal) {
        signal.addEventListener("abort", () => xhr.abort());
      }

      xhr.send(formData);
    });
  },

  async downloadFile(id) {
    const { blob, filename } = await apiFetchBlob(`/api/files/${encodeURIComponent(id)}/download`);
    triggerBrowserDownload(blob, filename);
    return { id, downloaded: true };
  },

  /**
   * Fetches a file's thumbnail as a blob. Callers create an object URL
   * from this to use as an <img> src — a plain <img src="..."> can't
   * carry the Authorization header this private endpoint needs.
   */
  async getThumbnailBlob(id) {
    const { blob } = await apiFetchBlob(`/api/files/${encodeURIComponent(id)}/thumbnail`);
    return blob;
  },

  /**
   * There is no /share endpoint on the backend (worker.js has no link-
   * sharing route), so this can't produce a shareable URL. Instead it
   * fetches the actual file and hands it to the OS share sheet via the
   * Web Share API — a real share, not a fake snackbar, with no backend
   * changes required.
   *
   * IMPORTANT: navigator.share() only works while the click's "user
   * activation" is still active, which can expire during a slow network
   * download. If that happens (or the browser/device doesn't support
   * sharing files at all), this falls back to a plain download instead
   * of surfacing a scary error — the file still ends up with the person
   * either way.
   */
  async shareFile(id) {
    const canShareFiles =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function";

    const { blob, filename } = await apiFetchBlob(`/api/files/${encodeURIComponent(id)}/download`);
    const file = new File([blob], filename, { type: blob.type || "application/octet-stream" });

    if (canShareFiles && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filename });
        return { id, shared: true };
      } catch (err) {
        // AbortError = person closed the share sheet on purpose.
        if (err?.name === "AbortError") return { id, shared: false, cancelled: true };
        // Anything else (most commonly a lost user-activation window on a
        // slow connection) — fall through to a plain download below
        // rather than showing an error for something that isn't fatal.
      }
    }

    triggerBrowserDownload(blob, filename);
    return { id, shared: false, downloaded: true };
  },

  async deleteFile(id) {
    await apiFetch(`/api/files/${encodeURIComponent(id)}`, { method: "DELETE" });
    return { id, deleted: true };
  },

  async renameFile(id, newName) {
    return apiFetch(`/api/files/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: { name: newName },
    });
  },

  async moveFile(id, targetFolderId) {
    return apiFetch(`/api/files/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: { folderId: targetFolderId },
    });
  },

  async createFolder(name, parentId = "root") {
    return apiFetch("/api/folders", {
      method: "POST",
      body: { name, parentId },
    });
  },

  async deleteFolder(id) {
    await apiFetch(`/api/folders/${encodeURIComponent(id)}`, { method: "DELETE" });
    return { id, deleted: true };
  },

  async restoreFile(id) {
    await apiFetch(`/api/trash/${encodeURIComponent(id)}/restore`, { method: "POST" });
    return { id, restored: true };
  },

  async purgeFile(id) {
    await apiFetch(`/api/trash/${encodeURIComponent(id)}`, { method: "DELETE" });
    return { id, purged: true };
  },
};
