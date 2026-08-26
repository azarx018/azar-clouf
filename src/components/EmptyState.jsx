import React from "react";
import { Cloud } from "lucide-react";
import Button from "./Button.jsx";
import "./EmptyState.css";

export default function EmptyState({
  icon: Icon = Cloud,
  title = "Your cloud is empty",
  description = "Upload your first file to start using AzarCloud.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Icon size={26} />
      </div>
      <div className="empty-state__title">{title}</div>
      <div className="empty-state__description">{description}</div>
      {actionLabel && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
