import React, { useEffect, useRef, useState } from "react";
import { X, RotateCcw, Check, AlertCircle } from "lucide-react";
import { Card, AtmosphereRing, EmptyState, useSnackbar } from "../components/index.js";
import { CloudService } from "../services/CloudService.js";
import "./UploadPage.css";

// Seed queue simulates files the user just picked from the upload sheet.
// A real picker (input[type=file] / drag-drop) would populate this instead.
const SEED_FILES = [
  { name: "LifeHub.zip", size: "482 MB" },
  { name: "OurSystem.apk", size: "38 MB" },
  { name: "backup.zip", size: "120 MB" },
];

const STATUS_LABEL = {
  waiting: "Waiting...",
  uploading: "Uploading...",
  completed: "Upload complete",
  failed: "Upload failed",
  cancelled: "Cancelled",
};

export default function UploadPage() {
  const [queue, setQueue] = useState(
    SEED_FILES.map((f, i) => ({ id: `u${i}`, ...f, status: "waiting", progress: 0 }))
  );
  const cancelledIds = useRef(new Set());
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    let cancelledEffect = false;

    async function runQueue() {
      for (const item of queue) {
        if (cancelledEffect) return;
        if (item.status !== "waiting") continue;
        if (cancelledIds.current.has(item.id)) continue;

        setQueue((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "uploading" } : f)));

        try {
          await CloudService.uploadFile(item, {
            onProgress: (progress) => {
              if (cancelledIds.current.has(item.id)) return;
              setQueue((prev) => prev.map((f) => (f.id === item.id ? { ...f, progress } : f)));
            },
          });
          if (cancelledIds.current.has(item.id)) continue;
          setQueue((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "completed", progress: 1 } : f)));
          showSnackbar(`${item.name} uploaded`);
        } catch {
          setQueue((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "failed" } : f)));
        }
      }
    }

    runQueue();
    return () => { cancelledEffect = true; };
    // Intentionally run once; retry/cancel mutate queue items directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelFile = (id) => {
    cancelledIds.current.add(id);
    setQueue((prev) => prev.map((f) => (f.id === id ? { ...f, status: "cancelled" } : f)));
  };

  const retryFile = async (id) => {
    cancelledIds.current.delete(id);
    setQueue((prev) => prev.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 0 } : f)));
    const item = queue.find((f) => f.id === id);
    try {
      await CloudService.uploadFile(item, {
        onProgress: (progress) => {
          if (cancelledIds.current.has(id)) return;
          setQueue((prev) => prev.map((f) => (f.id === id ? { ...f, progress } : f)));
        },
      });
      if (cancelledIds.current.has(id)) return;
      setQueue((prev) => prev.map((f) => (f.id === id ? { ...f, status: "completed", progress: 1 } : f)));
      showSnackbar(`${item.name} uploaded`);
    } catch {
      setQueue((prev) => prev.map((f) => (f.id === id ? { ...f, status: "failed" } : f)));
    }
  };

  if (queue.length === 0) {
    return <EmptyState title="No uploads in progress" description="Files you upload will appear here while they transfer." />;
  }

  const activeCount = queue.filter((f) => f.status === "uploading" || f.status === "waiting").length;

  return (
    <div className="upload-page">
      <h1 className="page-title">
        {activeCount > 0 ? `Uploading ${activeCount} file${activeCount === 1 ? "" : "s"}` : "Uploads"}
      </h1>

      <div className="upload-queue">
        {queue.map((file) => (
          <Card key={file.id} className="upload-item">
            <div className="upload-item__ring">
              <AtmosphereRing value={file.progress} size={44} stroke={4}>
                {file.status === "completed" ? (
                  <Check size={16} color="var(--success)" />
                ) : file.status === "failed" ? (
                  <AlertCircle size={16} color="var(--error)" />
                ) : (
                  <span className="upload-item__pct">{Math.round(file.progress * 100)}%</span>
                )}
              </AtmosphereRing>
            </div>
            <div className="upload-item__body">
              <div className="upload-item__name">{file.name}</div>
              <div className={`upload-item__status upload-item__status--${file.status}`}>
                {STATUS_LABEL[file.status]} · {file.size}
              </div>
            </div>
            {(file.status === "uploading" || file.status === "waiting") && (
              <button className="upload-item__action" onClick={() => cancelFile(file.id)} aria-label={`Cancel ${file.name}`}>
                <X size={16} />
              </button>
            )}
            {(file.status === "failed" || file.status === "cancelled") && (
              <button className="upload-item__action" onClick={() => retryFile(file.id)} aria-label={`Retry ${file.name}`}>
                <RotateCcw size={16} />
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
