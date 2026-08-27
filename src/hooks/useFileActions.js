import { useState, useCallback } from "react";
import { useSnackbar } from "../components/Snackbar.jsx";
import { CloudService } from "../services/CloudService.js";
import { getFriendlyErrorMessage } from "../services/errorMessages.js";

/**
 * Wires up the file "..." menu (ActionSheet), the delete confirmation
 * dialog, the rename dialog, and the move dialog so every page (My Cloud,
 * Folder, Recent, Search, Favorites, Trash) handles file actions the same
 * way, backed by the real API.
 *
 * onDeleted / onFavoriteChanged / onChanged let a page refresh its own
 * file list after a mutation (e.g. re-run the current CloudService query).
 */
export function useFileActions({ onDeleted, onFavoriteChanged, onChanged } = {}) {
  const [menuFile, setMenuFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [moveTarget, setMoveTarget] = useState(null);
  const { showSnackbar } = useSnackbar();

  const openMenu = useCallback((file) => setMenuFile(file), []);
  const closeMenu = useCallback(() => setMenuFile(null), []);

  const handleAction = useCallback(async (key) => {
    const file = menuFile;
    setMenuFile(null);
    if (!file) return;

    switch (key) {
      case "download":
        try {
          await CloudService.downloadFile(file.id);
          showSnackbar(`Downloading ${file.name}...`);
        } catch (err) {
          showSnackbar(getFriendlyErrorMessage(err), { tone: "error" });
        }
        break;
      case "rename":
        setRenameTarget(file);
        break;
      case "move":
        setMoveTarget(file);
        break;
      case "share":
        try {
          const result = await CloudService.shareFile(file.id);
          if (result.cancelled) {
            // person closed the OS share sheet — no message needed
          } else if (result.shared) {
            showSnackbar(`Shared ${file.name}`);
          } else {
            showSnackbar(`Sharing isn't supported here — downloaded ${file.name} instead`);
          }
        } catch (err) {
          showSnackbar(getFriendlyErrorMessage(err), { tone: "error" });
        }
        break;
      case "favorite":
        try {
          await CloudService.addFavorite(file.id);
          showSnackbar(`Added "${file.name}" to Favorites`);
          onFavoriteChanged?.(file);
        } catch (err) {
          showSnackbar(getFriendlyErrorMessage(err), { tone: "error" });
        }
        break;
      case "unfavorite":
        try {
          await CloudService.removeFavorite(file.id);
          showSnackbar(`Removed "${file.name}" from Favorites`);
          onFavoriteChanged?.(file);
        } catch (err) {
          showSnackbar(getFriendlyErrorMessage(err), { tone: "error" });
        }
        break;
      case "info":
        showSnackbar(`${file.name} · ${file.size}`);
        break;
      case "delete":
        setDeleteTarget(file);
        break;
      default:
        break;
    }
  }, [menuFile, showSnackbar, onFavoriteChanged]);

  const confirmDelete = useCallback(async () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    if (!target) return;
    try {
      await CloudService.deleteFile(target.id);
      showSnackbar(`"${target.name}" moved to Trash`);
      onDeleted?.(target);
    } catch (err) {
      showSnackbar(getFriendlyErrorMessage(err), { tone: "error" });
    }
  }, [deleteTarget, onDeleted, showSnackbar]);

  const cancelDelete = useCallback(() => setDeleteTarget(null), []);

  const submitRename = useCallback(async (newName) => {
    const target = renameTarget;
    setRenameTarget(null);
    if (!target) return;
    try {
      await CloudService.renameFile(target.id, newName);
      showSnackbar(`Renamed to "${newName}"`);
      onChanged?.(target);
    } catch (err) {
      showSnackbar(getFriendlyErrorMessage(err), { tone: "error" });
    }
  }, [renameTarget, onChanged, showSnackbar]);

  const cancelRename = useCallback(() => setRenameTarget(null), []);

  const submitMove = useCallback(async (targetFolderId) => {
    const target = moveTarget;
    setMoveTarget(null);
    if (!target) return;
    try {
      await CloudService.moveFile(target.id, targetFolderId);
      showSnackbar(`Moved "${target.name}"`);
      onChanged?.(target);
    } catch (err) {
      showSnackbar(getFriendlyErrorMessage(err), { tone: "error" });
    }
  }, [moveTarget, onChanged, showSnackbar]);

  const cancelMove = useCallback(() => setMoveTarget(null), []);

  return {
    menuFile, openMenu, closeMenu, handleAction,
    deleteTarget, confirmDelete, cancelDelete,
    renameTarget, submitRename, cancelRename,
    moveTarget, submitMove, cancelMove,
  };
}
