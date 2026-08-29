import React from "react";
import { Folder, MoreVertical } from "lucide-react";
import Card from "./Card.jsx";
import "./FolderCard.css";

export default function FolderCard({ folder, fileCount, onOpen, onMenu }) {
  return (
    <Card className="folder-card" onClick={() => onOpen?.(folder)}>
      {onMenu && (
        <button
          className="folder-card__menu"
          onClick={(e) => {
            e.stopPropagation();
            onMenu(folder);
          }}
          aria-label={`Options for ${folder.name}`}
        >
          <MoreVertical size={15} />
        </button>
      )}
      <Folder size={20} className="folder-card__icon" />
      <div className="folder-card__name">{folder.name}</div>
      <div className="folder-card__meta">{fileCount} files</div>
    </Card>
  );
}
