import React from "react";
import { Search, X } from "lucide-react";
import "./Input.css";

export function Input({ placeholder, value, onChange, type = "text" }) {
  return (
    <div className="input">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}

export function SearchInput({ value, onChange, onClear, placeholder = "Search files..." }) {
  return (
    <div className="input input--search">
      <Search size={16} className="input__icon" />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {value && (
        <button type="button" className="input__clear" onClick={onClear} aria-label="Clear search">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
