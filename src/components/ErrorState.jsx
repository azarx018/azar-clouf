import React from "react";
import { CloudOff } from "lucide-react";
import Button from "./Button.jsx";
import "./ErrorState.css";

export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn't connect to your cloud.",
  onRetry,
}) {
  return (
    <div className="error-state">
      <div className="error-state__icon">
        <CloudOff size={26} />
      </div>
      <div className="error-state__title">{title}</div>
      <div className="error-state__description">{description}</div>
      {onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
