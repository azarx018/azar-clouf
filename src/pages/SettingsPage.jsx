import React from "react";
import { Sun, Moon } from "lucide-react";
import { Card } from "../components/index.js";
import "./SettingsPage.css";

export default function SettingsPage({ theme, onToggleTheme }) {
  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <Card className="settings-row" onClick={onToggleTheme}>
        <div className="settings-row__icon">
          {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
        </div>
        <div className="settings-row__body">
          <div className="settings-row__label">Appearance</div>
          <div className="settings-row__value">{theme === "dark" ? "Dark mode" : "Light mode"}</div>
        </div>
      </Card>
    </div>
  );
}
