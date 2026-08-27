import React, { useEffect, useRef, useState } from "react";
import { Plus, Upload, FolderPlus } from "lucide-react";
import { Card, AtmosphereRing, Dialog, ActionSheet, Button, Skeleton, ErrorState, RenameDialog, MoveDialog, useSnackbar } from "../components/index.js";
import FolderCard from "../components/FolderCard.jsx";
import FileRow from "../components/FileRow.jsx";
import { useFileActions } from "../hooks/useFileActions.js";
import { useAsync } from "../hooks/useAsync.js";
import { useRouter } from "../router/router.jsx";
import { CloudService } from "../services/CloudService.js";
import { useUploadQueue } from "../upload/UploadContext.jsx";
import { getFriendlyErrorMessage } from "../services/errorMessages.js";
import { formatBytes } from "../utils/formatBytes.js";
import { onDataChanged } from "../refreshBus.js";
import "./MyCloudPage.css";

export default function MyCloudPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { navigate } = useRouter();
  const { enqueueFiles } = useUploadQueue();
  const fileInputRef = useRef(null);

  const storageState = useAsync(() => CloudService.getStorageOverview(), []);
  const foldersState = useAsync(() => CloudService.getSubfolders("root"), []);
  const filesState = useAsync(() => CloudService.getFiles("root"), []);

  const reloadAll = () => {
    storageState.reload();
    foldersState.reload();
    filesState.reload();
  };

  // A "New folder" created from the top-level menu should show up here.
  useEffect(() => onDataChanged(reloadAll), []); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    menuFile, openMenu, closeMenu, handleAction,
    deleteTarget, confirmDelete, cancelDelete,
    renameTarget, submitRename, cancelRename,
    moveTarget, submitMove, cancelMove,
  } = useFileActions({
    onDeleted: () => filesState.reload(),
    onFavoriteChanged: () => filesState.reload(),
    onChanged: reloadAll,
  });

  const handleFilesPicked = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      enqueueFiles(files, "root");
      navigate("/upload");
    }
    e.target.value = "";
  };

  const anyError = storageState.error || foldersState.error || filesState.error;
  if (anyError) {
    return (
      <ErrorState
        description={getFriendlyErrorMessage(anyError)}
        onRetry={reloadAll}
      />
    );
  }

  const usedRatio = storageState.data ? storageState.data.usedBytes / storageState.data.totalBytes : 0;

  return (
    <div className="my-cloud">
      <h1 className="page-title">My Cloud</h1>

      <Card className="storage-card">
        {storageState.loading ? (
          <>
            <Skeleton width={88} height={88} radius={999} />
            <div style={{ flex: 1 }}>
              <Skeleton width="60%" height={16} />
              <div style={{ height: 8 }} />
              <Skeleton width="40%" height={12} />
            </div>
          </>
        ) : (
          <>
            <AtmosphereRing value={usedRatio} size={88} stroke={7}>
              <div className="storage-card__ring-value">{formatBytes(storageState.data.usedBytes)}</div>
              <div className="storage-card__ring-label">used</div>
            </AtmosphereRing>
            <div className="storage-card__info">
              <div className="storage-card__heading">Cloud Storage</div>
              <div className="storage-card__meta">
                {storageState.data.fileCount} file{storageState.data.fileCount === 1 ? "" : "s"} · {formatBytes(storageState.data.totalBytes)} total
              </div>
            </div>
          </>
        )}
      </Card>

      <section className="my-cloud__section">
        <h2 className="section-label">Folders</h2>
        <div className="folder-grid">
          {foldersState.loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><Skeleton height={18} width="70%" /><div style={{ height: 8 }} /><Skeleton height={12} width="40%" /></Card>
              ))
            : foldersState.data.map((f) => (
                <FolderCard
                  key={f.id}
                  folder={f}
                  fileCount={f.fileCount}
                  onOpen={(folder) => navigate(`/folder/${folder.id}`)}
                />
              ))}
        </div>
      </section>

      <section className="my-cloud__section">
        <h2 className="section-label">Recent</h2>
        <Card className="file-list">
          {filesState.loading ? (
            <div style={{ padding: "var(--space-2) 0", display: "flex", flexDirection: "column", gap: 12 }}>
              <Skeleton height={14} width="50%" />
              <Skeleton height={14} width="65%" />
              <Skeleton height={14} width="40%" />
            </div>
          ) : filesState.data.length === 0 ? (
            <div style={{ padding: "var(--space-4) 0", textAlign: "center", color: "var(--mist)", fontSize: "var(--text-sm)" }}>
              No files yet.
            </div>
          ) : (
            filesState.data.map((file) => (
              <FileRow
                key={file.id}
                file={file}
                onOpen={(f) => navigate(`/file/${f.id}`)}
                onMenu={openMenu}
              />
            ))
          )}
        </Card>
      </section>

      <button className="fab" onClick={() => setUploadOpen(true)} aria-label="Add to AzarCloud">
        <Plus size={24} />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={handleFilesPicked}
      />

      <Dialog open={uploadOpen} title="Add to AzarCloud" onClose={() => setUploadOpen(false)}>
        <div className="upload-sheet__options">
          <Button variant="secondary" icon={Upload} onClick={() => { setUploadOpen(false); fileInputRef.current?.click(); }}>
            Upload files
          </Button>
          <Button variant="secondary" icon={FolderPlus} onClick={() => { setUploadOpen(false); fileInputRef.current?.click(); }}>
            Upload folder
          </Button>
        </div>
      </Dialog>

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
