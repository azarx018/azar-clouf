import React from "react";
import { Folder } from "lucide-react";
import Card from "./Card.jsx";
import "./FolderCard.css";

export default function FolderCard({ folder, fileCount, onOpen }) {
  return (
    <Card className="folder-card" onClick={() => onOpen?.(folder)}>
      <Folder size={20} className="folder-card__icon" />
      <div className="folder-card__name">{folder.name}</div>
      <div className="folder-card__meta">{fileCount} files</div>
    </Card>
  );
}
