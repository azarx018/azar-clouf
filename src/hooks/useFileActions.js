import { useState, useCallback } from "react";
import { useSnackbar } from "../components/Snackbar.jsx";

/**
 * Wires up the file "..." menu (ActionSheet) and the delete confirmation
 * dialog so every page (My Cloud, Folder, Recent, Search, Favorites,
 * Trash) handles file actions the same way.
 */
export function useFileActions({ onDeleted } = {}) {
  const [menuFile, setMenuFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showSnackbar } = useSnackbar();

  const openMenu = useCallback((file) => setMenuFile(file), []);
  const closeMenu = useCallback(() => setMenuFile(null), []);

  const handleAction = useCallback((key) => {
    const file = menuFile;
    setMenuFile(null);
    if (!file) return;

    switch (key) {
      case "download":
        showSnackbar(`Downloading ${file.name}...`);
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
      case "info":
        showSnackbar(`${file.name} · ${file.size}`);
        break;
      case "delete":
        setDeleteTarget(file);
        break;
      default:
        break;
    }
  }, [menuFile, showSnackbar]);

  const confirmDelete = useCallback(() => {
    if (deleteTarget) {
      showSnackbar(`"${deleteTarget.name}" moved to Trash`);
      onDeleted?.(deleteTarget);
    }
    setDeleteTarget(null);
  }, [deleteTarget, onDeleted, showSnackbar]);

  const cancelDelete = useCallback(() => setDeleteTarget(null), []);

  return { menuFile, openMenu, closeMenu, handleAction, deleteTarget, confirmDelete, cancelDelete };
}
