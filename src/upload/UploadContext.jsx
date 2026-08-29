import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { CloudService } from "../services/CloudService.js";
import { emitDataChanged } from "../refreshBus.js";

const UploadContext = createContext(null);

let nextId = 1;

// Codes worth a quiet automatic retry (transient/backend hiccups,
// e.g. a Telegram flood-control response getting collapsed into
// "storage_unavailable" by the backend). Codes NOT in this list
// (invalid_input, file_too_large, unauthorized, ...) are permanent
// failures — retrying wouldn't help, so we fail immediately instead.
const RETRYABLE_CODES = new Set(["network_error", "storage_unavailable", "internal_error"]);
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Holds the upload queue and drives uploads through CloudService.uploadFile
 * (POST /api/upload) STRICTLY ONE AT A TIME. Sending many files at once
 * risks tripping Telegram's per-channel flood control (it allows roughly
 * one message/second to the same channel) — going one-by-one, with real
 * network latency between requests, naturally stays under that.
 */
export function UploadProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const queueRef = useRef([]);
  const activeRef = useRef(false);
  const controllersRef = useRef(new Map());

  const updateItem = useCallback((id, patch) => {
    setQueue((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...patch } : item));
      queueRef.current = next;
      return next;
    });
  }, []);

  const processNext = useCallback(() => {
    if (activeRef.current) return;
    const next = queueRef.current.find((item) => item.status === "queued");
    if (!next) return;

    activeRef.current = true;
    updateItem(next.id, { status: "uploading", progress: 0 });

    const controller = new AbortController();
    controllersRef.current.set(next.id, controller);

    const attempt = async (retriesLeft) => {
      try {
        await CloudService.uploadFile(next.file, {
          folderId: next.folderId,
          onProgress: (progress) => updateItem(next.id, { progress }),
          signal: controller.signal,
        });
        updateItem(next.id, { status: "completed", progress: 1 });
        emitDataChanged();
      } catch (err) {
        if (err?.code === "cancelled") {
          // Status was already set to "cancelled" by cancelItem — don't
          // let this overwrite it back to "failed".
          return;
        }
        if (retriesLeft > 0 && RETRYABLE_CODES.has(err?.code)) {
          updateItem(next.id, { status: "retrying" });
          await wait(RETRY_DELAY_MS);
          return attempt(retriesLeft - 1);
        }
        updateItem(next.id, { status: "failed", error: err });
      }
    };

    attempt(MAX_RETRIES).finally(() => {
      controllersRef.current.delete(next.id);
      activeRef.current = false;
      processNext();
    });
  }, [updateItem]);

  const enqueueFiles = useCallback(
    (fileList, folderId = "root") => {
      const items = Array.from(fileList).map((file) => ({
        id: `u${nextId++}`,
        file,
        name: file.name,
        size: file.size,
        folderId,
        status: "queued",
        progress: 0,
      }));
      setQueue((prev) => {
        const next = [...items, ...prev];
        queueRef.current = next;
        return next;
      });
      processNext();
    },
    [processNext]
  );

  const cancelItem = useCallback((id) => {
    // If this item is currently uploading, actually abort the underlying
    // XHR instead of just changing the label — otherwise the request
    // would keep running and flip the status back to completed/failed
    // once it eventually resolves, ignoring the cancel.
    const controller = controllersRef.current.get(id);
    if (controller) controller.abort();
    updateItem(id, { status: "cancelled" });
  }, [updateItem]);

  const retryItem = useCallback(
    (id) => {
      updateItem(id, { status: "queued", progress: 0 });
      processNext();
    },
    [updateItem, processNext]
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
