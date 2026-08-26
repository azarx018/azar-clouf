import {
  storage as mockStorage,
  folderTree,
  filesByFolder,
  favoriteFileIds,
  trashedFiles as mockTrash,
  getSubfolders as mockGetSubfolders,
  getFolder as mockGetFolder,
  getBreadcrumb as mockGetBreadcrumb,
  getFilesIn as mockGetFilesIn,
  getFile as mockGetFile,
  searchFiles as mockSearchFiles,
} from "../data/mock.js";

// ---------------------------------------------------------------------
// Simulated network latency + occasional failure, so UI loading/error
// states have something real to respond to during frontend-only sprints.
// Set SIMULATE_ERRORS to true locally to test ErrorState rendering.
// ---------------------------------------------------------------------
const LATENCY_MS = 380;
const SIMULATE_ERRORS = false;

function resolveAfterDelay(value) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (SIMULATE_ERRORS && Math.random() < 0.15) {
        reject(new Error("network_error"));
      } else {
        resolve(value);
      }
    }, LATENCY_MS);
  });
}

/**
 * CloudService is the ONLY module allowed to know how AzarCloud's data
 * is fetched. Pages/components call these methods and never touch the
 * API, fetch(), or mock data directly.
 *
 * PWA UI -> CloudService -> AzarCloud API -> Backend -> Storage
 *
 * When the real backend is ready, replace each method body with a
 * fetch() call to the AzarCloud API (e.g. `fetch('/api/folders/' + id)`)
 * and keep the same method signatures — no page code needs to change.
 * The frontend must never hold Telegram tokens, channel IDs, or any
 * backend secret; CloudService only speaks in File/Folder terms.
 */
export const CloudService = {
  async getStorageOverview() {
    return resolveAfterDelay({ ...mockStorage });
  },

  async getSubfolders(parentId = "root") {
    const subfolders = mockGetSubfolders(parentId).map((f) => ({
      ...f,
      fileCount: mockGetFilesIn(f.id).length,
    }));
    return resolveAfterDelay(subfolders);
  },

  async getFolder(id) {
    return resolveAfterDelay(mockGetFolder(id));
  },

  async getBreadcrumb(id) {
    return resolveAfterDelay(mockGetBreadcrumb(id));
  },

  async getFiles(folderId = "root") {
    return resolveAfterDelay(mockGetFilesIn(folderId));
  },

  async getFile(id) {
    return resolveAfterDelay(mockGetFile(id));
  },

  async searchFiles(query) {
    return resolveAfterDelay(mockSearchFiles(query));
  },

  async getFavorites() {
    return resolveAfterDelay(favoriteFileIds.map(mockGetFile).filter(Boolean));
  },

  async getTrash() {
    return resolveAfterDelay([...mockTrash]);
  },

  async uploadFile(file, { onProgress } = {}) {
    // Simulated chunked progress. Real implementation should POST to
    // the AzarCloud API (multipart or resumable upload) and forward
    // progress events from the underlying XHR/fetch stream.
    return new Promise((resolve) => {
      let progress = 0;
      const timer = setInterval(() => {
        progress = Math.min(1, progress + 0.12);
        onProgress?.(progress);
        if (progress >= 1) {
          clearInterval(timer);
          resolve({ id: `f_${Date.now()}`, name: file?.name || "New file", status: "completed" });
        }
      }, 400);
    });
  },

  async downloadFile(id) {
    return resolveAfterDelay({ id, url: `#download-${id}` });
  },

  async deleteFile(id) {
    return resolveAfterDelay({ id, deleted: true });
  },

  async renameFile(id, newName) {
    return resolveAfterDelay({ id, name: newName });
  },

  async moveFile(id, targetFolderId) {
    return resolveAfterDelay({ id, folderId: targetFolderId });
  },

  async createFolder(name, parentId = "root") {
    return resolveAfterDelay({ id: `folder_${Date.now()}`, name, parentId });
  },

  async deleteFolder(id) {
    return resolveAfterDelay({ id, deleted: true });
  },

  async restoreFile(id) {
    return resolveAfterDelay({ id, restored: true });
  },

  async purgeFile(id) {
    return resolveAfterDelay({ id, purged: true });
  },
};
