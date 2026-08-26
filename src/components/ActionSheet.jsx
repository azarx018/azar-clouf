import React from "react";
import { Download, Edit2, FolderInput, Share2, Info, Star, Trash2 } from "lucide-react";
import "./ActionSheet.css";

const DEFAULT_ACTIONS = [
  { key: "download", label: "Download", icon: Download },
  { key: "favorite", label: "Add to Favorites", icon: Star },
  { key: "rename", label: "Rename", icon: Edit2 },
  { key: "move", label: "Move", icon: FolderInput },
  { key: "share", label: "Share", icon: Share2 },
  { key: "info", label: "Get info", icon: Info },
  { key: "delete", label: "Delete", icon: Trash2, danger: true },
];

export const FAVORITES_PAGE_ACTIONS = [
  { key: "download", label: "Download", icon: Download },
  { key: "unfavorite", label: "Remove from Favorites", icon: Star },
  { key: "share", label: "Share", icon: Share2 },
  { key: "info", label: "Get info", icon: Info },
  { key: "delete", label: "Delete", icon: Trash2, danger: true },
];

/**
 * File context menu, shared by the file-detail page and the "..." menu
 * on a file row. onAction receives the action key ("download", "delete", ...).
 */
export default function ActionSheet({ open, fileName, onClose, onAction, actions = DEFAULT_ACTIONS }) {
  if (!open) return null;

  return (
    <div className="action-sheet-overlay" onClick={onClose}>
      <div className="action-sheet" onClick={(e) => e.stopPropagation()}>
        {fileName && <div className="action-sheet__title">{fileName}</div>}
        <div className="action-sheet__list">
          {actions.map((action) => (
            <button
              key={action.key}
              className={`action-sheet__item ${action.danger ? "is-danger" : ""}`}
              onClick={() => onAction?.(action.key)}
            >
              <action.icon size={18} />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
