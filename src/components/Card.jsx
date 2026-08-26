import React from "react";
import "./Card.css";

export default function Card({ children, className = "", onClick, style }) {
  const interactive = typeof onClick === "function";
  return (
    <div
      className={`card ${interactive ? "card--interactive" : ""} ${className}`}
      onClick={onClick}
      style={style}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
}
