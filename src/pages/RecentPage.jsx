import React from "react";
import { Card, ActionSheet, Dialog, Button, EmptyState, ErrorState, Skeleton, RenameDialog, MoveDialog } from "../components/index.js";
import FileRow from "../components/FileRow.jsx";
import { useFileActions } from "../hooks/useFileActions.js";
import { useAsync } from "../hooks/useAsync.js";
import { useRouter } from "../router/router.jsx";
import { CloudService } from "../services/CloudService.js";
import { getFriendlyErrorMessage } from "../services/errorMessages.js";
import "./RecentPage.css";

export default function RecentPage() {
  const { navigate } = useRouter();
  const { data: files, loading, error, reload } = useAsync(() => CloudService.getFiles("root"), []);
  const {
    menuFile, openMenu, closeMenu, handleAction,
    deleteTarget, confirmDelete, cancelDelete,
    renameTarget, submitRename, cancelRename,
    moveTarget, submitMove, cancelMove,
  } = useFileActions({
    onDeleted: reload,
    onFavoriteChanged: reload,
    onChanged: reload,
  });

  if (error) return <ErrorState description={getFriendlyErrorMessage(error)} onRetry={reload} />;

  return (
    <div className="recent-page">
      <h1 className="page-title">Recent</h1>

      {loading ? (
        <Card className="file-list">
          <div style={{ padding: "var(--space-2) 0", display: "flex", flexDirection: "column", gap: 12 }}>
            <Skeleton height={14} width="50%" />
            <Skeleton height={14} width="65%" />
            <Skeleton height={14} width="40%" />
          </div>
        </Card>
      ) : files.length === 0 ? (
        <EmptyState title="Nothing recent yet" description="Files you upload or open will show up here." />
      ) : (
        <Card className="file-list">
          {files.map((file) => (
            <FileRow key={file.id} file={file} onOpen={(f) => navigate(`/file/${f.id}`)} onMenu={openMenu} />
          ))}
        </Card>
      )}

      <ActionSheet open={!!menuFile} fileName={menuFile?.name} onClose={closeMenu} onAction={handleAction} />
      <Dialog
        open={!!deleteTarget}
        title={deleteTarget ? `Delete "${deleteTarget.name}"?` : ""}
        description="This file will be removed from your cloud."
        onClose={cancelDelete}
      >
        <Button variant="secondary" onClick={cancelDelete}>Cancel</Button>
        <Button variant="danger" onClick={confirmDelete}>Delete</Button>
      </Dialog>
      <RenameDialog target={renameTarget} onCancel={cancelRename} onSubmit={submitRename} />
      <MoveDialog target={moveTarget} onCancel={cancelMove} onSubmit={submitMove} />
    </div>
  );
}
