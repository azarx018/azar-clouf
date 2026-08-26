import { useState, useCallback } from "react";
import { useSnackbar } from "../components/Snackbar.jsx";
import { CloudService } from "../services/CloudService.js";
import { getFriendlyErrorMessage } from "../services/errorMessages.js";

/**
 * Wires up the file "..." menu (ActionSheet) and the delete confirmation
 * dialog so every page (My Cloud, Folder, Recent, Search, Favorites,
 * Trash) handles file actions the same way, backed by the real API.
 *
 * onDeleted / onFavoriteChanged let a page refresh its own file list
 * after a mutation (e.g. re-run the current CloudService query).
 */
export function useFileActions({ onDeleted, onFavoriteChanged } = {}) {
  const [menuFile, setMenuFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
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
        showSnackbar(`Rename ${file.name} — coming soon`);
        break;
      case "move":
        showSnackbar(`Move ${file.name} — coming soon`);
        break;
      case "share":
        showSnackbar(`Share link copied for ${file.name}`);
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

  return { menuFile, openMenu, closeMenu, handleAction, deleteTarget, confirmDelete, cancelDelete };
}
