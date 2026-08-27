import React, { createContext, useCallback, useContext, useState } from "react";
import { CloudService } from "../services/CloudService.js";
import { emitDataChanged } from "../refreshBus.js";

const UploadContext = createContext(null);

let nextId = 1;

/**
 * Holds the in-progress upload queue so it survives navigating from
 * "pick a file" (My Cloud) to the Uploads page, and drives each upload
 * through CloudService.uploadFile (POST /api/upload).
 */
export function UploadProvider({ children }) {
  const [queue, setQueue] = useState([]);

  const updateItem = useCallback((id, patch) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const runUpload = useCallback(
    (item) => {
      CloudService.uploadFile(item.file, {
        folderId: item.folderId,
        onProgress: (progress) => updateItem(item.id, { progress }),
      })
        .then(() => {
          updateItem(item.id, { status: "completed", progress: 1 });
          // Let My Cloud / Folder pages know storage usage & file lists changed.
          emitDataChanged();
        })
        .catch((err) => updateItem(item.id, { status: "failed", error: err }));
    },
    [updateItem]
  );

  const enqueueFiles = useCallback(
    (fileList, folderId = "root") => {
      const items = Array.from(fileList).map((file) => ({
        id: `u${nextId++}`,
        file,
        name: file.name,
        size: file.size,
        folderId,
        status: "uploading",
        progress: 0,
      }));
      setQueue((prev) => [...items, ...prev]);
      items.forEach(runUpload);
    },
    [runUpload]
  );

  const cancelItem = useCallback((id) => {
    // The underlying XHR isn't tracked for cancellation here; marking it
    // cancelled stops the UI from treating it as active/retryable-inline.
    updateItem(id, { status: "cancelled" });
  }, [updateItem]);

  const retryItem = useCallback(
    (id) => {
      setQueue((prev) => {
        const item = prev.find((f) => f.id === id);
        if (item) runUpload({ ...item, status: "uploading", progress: 0 });
        return prev.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 0 } : f));
      });
    },
    [runUpload]
  );

  return (
    <UploadContext.Provider value={{ queue, enqueueFiles, cancelItem, retryItem }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUploadQueue() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUploadQueue must be used within UploadProvider");
  return ctx;
}
