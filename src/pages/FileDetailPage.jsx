import React, { useState } from "react";
import { Download, Edit2, FolderInput, Share2, Star, Trash2 } from "lucide-react";
import { Card, Dialog, Button, EmptyState, ErrorState, Skeleton, useSnackbar } from "../components/index.js";
import { iconForType } from "../utils/fileIcons.js";
import { useAsync } from "../hooks/useAsync.js";
import { usePageTitle } from "../pageTitle.jsx";
import { useRouter } from "../router/router.jsx";
import { CloudService } from "../services/CloudService.js";
import { getFriendlyErrorMessage } from "../services/errorMessages.js";
import "./FileDetailPage.css";

export default function FileDetailPage({ params }) {
  const { navigate } = useRouter();
  const { showSnackbar } = useSnackbar();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { data: file, loading, error, reload } = useAsync(() => CloudService.getFile(params.id), [params.id]);

  usePageTitle(file?.name);

  if (error) return <ErrorState description={getFriendlyErrorMessage(error)} onRetry={reload} />;

  if (loading) {
    return (
      <div className="file-detail">
        <Skeleton width={64} height={64} radius={14} />
        <div style={{ height: 16 }} />
        <Skeleton width="60%" height={20} />
      </div>
    );
  }

  if (!file) {
    return (
      <EmptyState
        title="File not found"
        description="This file may have been moved or deleted."
        actionLabel="Back to My Cloud"
        onAction={() => navigate("/")}
      />
    );
  }

  const Icon = iconForType(file.type);
  const backTo = file.folderId && file.folderId !== "root" ? `/folder/${file.folderId}` : "/";

  const runAction = async (key) => {
    switch (key) {
      case "download":
        try {
          await CloudService.downloadFile(file.id);
          showSnackbar(`Downloading ${file.name}...`);
        } catch (err) {
          showSnackbar(getFriendlyErrorMessage(err), { tone: "error" });
        }
        break;
      case "favorite":
        try {
          await CloudService.addFavorite(file.id);
          showSnackbar(`Added "${file.name}" to Favorites`);
        } catch (err) {
          showSnackbar(getFriendlyErrorMessage(err), { tone: "error" });
        }
        break;
      case "rename":
        showSnackbar(`Rename ${file.name} — coming soon`);
        break;
      case "move":
        showSnackbar(`Move ${file.name} — coming soon`);
        break;
      case "share":
        showSnackbar(`Share link copied for ${file.name}`);
        break;
      default:
        break;
    }
  };

  const confirmDelete = async () => {
    setDeleteOpen(false);
    try {
      await CloudService.deleteFile(file.id);
      showSnackbar(`"${file.name}" moved to Trash`);
      navigate(backTo);
    } catch (err) {
      showSnackbar(getFriendlyErrorMessage(err), { tone: "error" });
    }
  };

  return (
    <div className="file-detail">
      <div className="file-detail__icon">
        <Icon size={30} />
      </div>
      <h1 className="file-detail__name">{file.name}</h1>
      <div className="file-detail__type">{file.type.toUpperCase()} archive</div>
      <div className="file-detail__size">{file.size}</div>

      <Card className="file-detail__meta-card">
        <div className="file-detail__meta-row">
          <span className="file-detail__meta-label">Uploaded</span>
          <span>{file.uploaded}</span>
        </div>
        <div className="file-detail__meta-row">
          <span className="file-detail__meta-label">Location</span>
          <span>{file.folderName || "My Cloud"}</span>
        </div>
      </Card>

      <div className="file-detail__actions">
        <Button icon={Download} onClick={() => runAction("download")}>Download</Button>
        <Button variant="secondary" icon={Star} onClick={() => runAction("favorite")}>Favorite</Button>
        <Button variant="secondary" icon={Edit2} onClick={() => runAction("rename")}>Rename</Button>
        <Button variant="secondary" icon={FolderInput} onClick={() => runAction("move")}>Move</Button>
        <Button variant="secondary" icon={Share2} onClick={() => runAction("share")}>Share</Button>
        <Button variant="danger" icon={Trash2} onClick={() => setDeleteOpen(true)}>Delete</Button>
      </div>

      <Dialog
        open={deleteOpen}
        title={`Delete "${file.name}"?`}
        description="This file will be removed from your cloud."
        onClose={() => setDeleteOpen(false)}
      >
        <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
        <Button variant="danger" onClick={confirmDelete}>Delete</Button>
      </Dialog>
    </div>
  );
}
