import React from "react";
import { X, RotateCcw, Check, AlertCircle } from "lucide-react";
import { Card, AtmosphereRing, EmptyState } from "../components/index.js";
import { useUploadQueue } from "../upload/UploadContext.jsx";
import { getFriendlyErrorMessage } from "../services/errorMessages.js";
import { formatBytes } from "../utils/formatBytes.js";
import "./UploadPage.css";

const STATUS_LABEL = {
  uploading: "Uploading...",
  completed: "Upload complete",
  failed: "Upload failed",
  cancelled: "Cancelled",
};

export default function UploadPage() {
  const { queue, cancelItem, retryItem } = useUploadQueue();

  if (queue.length === 0) {
    return <EmptyState title="No uploads in progress" description="Files you upload will appear here while they transfer." />;
  }

  const activeCount = queue.filter((f) => f.status === "uploading").length;

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
                  <span className="upload-item__pct">{Math.round((file.progress || 0) * 100)}%</span>
                )}
              </AtmosphereRing>
            </div>
            <div className="upload-item__body">
              <div className="upload-item__name">{file.name}</div>
              <div className={`upload-item__status upload-item__status--${file.status}`}>
                {file.status === "failed" && file.error
                  ? getFriendlyErrorMessage(file.error)
                  : STATUS_LABEL[file.status]}
                {" · "}
                {formatBytes(file.size)}
              </div>
            </div>
            {file.status === "uploading" && (
              <button className="upload-item__action" onClick={() => cancelItem(file.id)} aria-label={`Cancel ${file.name}`}>
                <X size={16} />
              </button>
            )}
            {(file.status === "failed" || file.status === "cancelled") && (
              <button className="upload-item__action" onClick={() => retryItem(file.id)} aria-label={`Retry ${file.name}`}>
                <RotateCcw size={16} />
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
