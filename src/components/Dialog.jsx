import React, { useEffect } from "react";
import "./Dialog.css";

export default function Dialog({ open, title, description, children, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="dialog-title">{title}</h3>}
        {description && <p className="dialog-description">{description}</p>}
        <div className="dialog-actions">{children}</div>
      </div>
    </div>
  );
}
