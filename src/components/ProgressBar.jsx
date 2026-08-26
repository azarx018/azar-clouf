import React from "react";
import "./ProgressBar.css";

/** Linear progress bar. value: 0–1 */
export default function ProgressBar({ value = 0, label }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
