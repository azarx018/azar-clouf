import React from "react";
import "./Skeleton.css";

export default function Skeleton({ width = "100%", height = 14, radius = 6 }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
