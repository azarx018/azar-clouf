import React, { useEffect, useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { Card, Dialog, Button, EmptyState, ErrorState, Skeleton, Thumbnail, useSnackbar } from "../components/index.js";
import { useAsync } from "../hooks/useAsync.js";
import { CloudService } from "../services/CloudService.js";
import { getFriendlyErrorMessage } from "../services/errorMessages.js";
import "./TrashPage.css";

export default function TrashPage() {
  const { data, loading, error, reload } = useAsync(() => CloudService.getTrash(), []);
  const [items, setItems] = useState(null);
  const [purgeTarget, setPurgeTarget] = useState(null);
  const { showSnackbar } = useSnackbar();

  // Sync local editable copy once the CloudService call resolves.
  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  if (error) return <ErrorState description={getFriendlyErrorMessage(error)} onRetry={reload} />;

  const restore = async (file) => {
    try {
      await CloudService.restoreFile(file.id);
      setItems((prev) => prev.filter((f) => f.id !== file.id));
      showSnackbar(`"${file.name}" restored to My Cloud`);
    } catch (err) {
      showSnackbar(getFriendlyErrorMessage(err), { tone: "error" });
    }
  };

  const confirmPurge = async () => {
    const target = purgeTarget;
    setPurgeTarget(null);
    try {
      await CloudService.purgeFile(target.id);
      setItems((prev) => prev.filter((f) => f.id !== target.id));
      showSnackbar(`"${target.name}" permanently deleted`);
    } catch (err) {
      showSnackbar(getFriendlyErrorMessage(err), { tone: "error" });
    }
  };

  if (loading || items === null) {
    return (
      <div className="trash-page">
        <h1 className="page-title">Trash</h1>
        <Card className="file-list">
          <div style={{ padding: "var(--space-2) 0", display: "flex", flexDirection: "column", gap: 12 }}>
            <Skeleton height={14} width="55%" />
          </div>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState title="Trash is empty" description="Deleted files will appear here for 30 days." />;
  }

  return (
    <div className="trash-page">
      <h1 className="page-title">Trash</h1>
      <div className="trash-page__note">Items are permanently deleted after 30 days.</div>
      <Card className="file-list">
        {items.map((file) => {
          return (
            <div key={file.id} className="trash-row">
              <Thumbnail file={file} size={38} />
              <div className="trash-row__body">
                <div className="trash-row__name">{file.name}</div>
                <div className="trash-row__meta">{file.type.toUpperCase()} · {file.size} · Deleted {file.deleted}</div>
              </div>
              <button className="trash-row__action" onClick={() => restore(file)} aria-label={`Restore ${file.name}`}>
                <RotateCcw size={16} />
              </button>
              <button className="trash-row__action trash-row__action--danger" onClick={() => setPurgeTarget(file)} aria-label={`Delete ${file.name} forever`}>
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </Card>

      <Dialog
        open={!!purgeTarget}
        title={purgeTarget ? `Permanently delete "${purgeTarget.name}"?` : ""}
        description="This can't be undone."
        onClose={() => setPurgeTarget(null)}
      >
        <Button variant="secondary" onClick={() => setPurgeTarget(null)}>Cancel</Button>
        <Button variant="danger" onClick={confirmPurge}>Delete forever</Button>
      </Dialog>
    </div>
  );
}
