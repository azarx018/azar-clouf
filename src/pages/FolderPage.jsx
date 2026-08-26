import React from "react";
import { ChevronRight } from "lucide-react";
import { Card, Dialog, ActionSheet, Button, EmptyState, ErrorState, Skeleton } from "../components/index.js";
import FolderCard from "../components/FolderCard.jsx";
import FileRow from "../components/FileRow.jsx";
import { useFileActions } from "../hooks/useFileActions.js";
import { useAsync } from "../hooks/useAsync.js";
import { usePageTitle } from "../pageTitle.jsx";
import { useRouter } from "../router/router.jsx";
import { CloudService } from "../services/CloudService.js";
import { getFriendlyErrorMessage } from "../services/errorMessages.js";
import "./FolderPage.css";

export default function FolderPage({ params }) {
  const { navigate } = useRouter();

  const { data, loading, error, reload } = useAsync(async () => {
    const [folder, subfolders, files, breadcrumb] = await Promise.all([
      CloudService.getFolder(params.id),
      CloudService.getSubfolders(params.id),
      CloudService.getFiles(params.id),
      CloudService.getBreadcrumb(params.id),
    ]);
    return { folder, subfolders, files, breadcrumb };
  }, [params.id]);

  const { menuFile, openMenu, closeMenu, handleAction, deleteTarget, confirmDelete, cancelDelete } = useFileActions({
    onDeleted: reload,
    onFavoriteChanged: reload,
  });

  usePageTitle(data?.folder?.name);

  if (error) return <ErrorState description={getFriendlyErrorMessage(error)} onRetry={reload} />;

  if (loading) {
    return (
      <div className="folder-page">
        <Skeleton width="40%" height={24} />
        <div style={{ height: 20 }} />
        <div className="folder-grid">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}><Skeleton height={18} width="70%" /><div style={{ height: 8 }} /><Skeleton height={12} width="40%" /></Card>
          ))}
        </div>
      </div>
    );
  }

  const { folder, subfolders, files, breadcrumb } = data;

  if (!folder) {
    return (
      <EmptyState
        title="Folder not found"
        description="This folder may have been moved or deleted."
        actionLabel="Back to My Cloud"
        onAction={() => navigate("/")}
      />
    );
  }

  const isEmpty = subfolders.length === 0 && files.length === 0;

  return (
    <div className="folder-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        {breadcrumb.map((crumb, i) => (
          <React.Fragment key={crumb.id}>
            {i > 0 && <ChevronRight size={13} />}
            <button
              className={`breadcrumb__item ${i === breadcrumb.length - 1 ? "is-current" : ""}`}
              onClick={() => navigate(crumb.id === "root" ? "/" : `/folder/${crumb.id}`)}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </nav>

      <h1 className="page-title">{folder.name}</h1>
      <div className="folder-page__count">{subfolders.length + files.length} items</div>

      {isEmpty && (
        <EmptyState title="This folder is empty" description="Upload a file to get started." />
      )}

      {subfolders.length > 0 && (
        <section className="folder-page__section">
          <h2 className="section-label">Folders</h2>
          <div className="folder-grid">
            {subfolders.map((f) => (
              <FolderCard
                key={f.id}
                folder={f}
                fileCount={f.fileCount}
                onOpen={(sub) => navigate(`/folder/${sub.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {files.length > 0 && (
        <section className="folder-page__section">
          <h2 className="section-label">Files</h2>
          <Card className="file-list">
            {files.map((file) => (
              <FileRow
                key={file.id}
                file={file}
                onOpen={(f) => navigate(`/file/${f.id}`)}
                onMenu={openMenu}
              />
            ))}
          </Card>
        </section>
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
    </div>
  );
}
