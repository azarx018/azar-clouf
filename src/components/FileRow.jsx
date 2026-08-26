import React from "react";
import { MoreVertical } from "lucide-react";
import { iconForType } from "../utils/fileIcons.js";
import "./FileRow.css";

export default function FileRow({ file, onOpen, onMenu, metaExtra }) {
  const Icon = iconForType(file.type);
  return (
    <div className="file-row" onClick={() => onOpen?.(file)}>
      <div className="file-row__icon">
        <Icon size={17} />
      </div>
      <div className="file-row__body">
        <div className="file-row__name">{file.name}</div>
        <div className="file-row__meta">
          {file.type.toUpperCase()} · {file.size}
          {metaExtra ? ` · ${metaExtra}` : ""}
        </div>
      </div>
      <button
        className="file-row__menu"
        aria-label={`More options for ${file.name}`}
        onClick={(e) => { e.stopPropagation(); onMenu?.(file); }}
      >
        <MoreVertical size={16} />
      </button>
    </div>
  );
}
