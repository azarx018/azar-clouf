import React from "react";
import { Sun, Moon, LogOut } from "lucide-react";
import { Card } from "../components/index.js";
import "./SettingsPage.css";

export default function SettingsPage({ theme, onToggleTheme, onLogout }) {
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

      <div style={{ height: 12 }} />

      <Card className="settings-row settings-row--danger" onClick={onLogout}>
        <div className="settings-row__icon settings-row__icon--danger">
          <LogOut size={18} />
        </div>
        <div className="settings-row__body">
          <div className="settings-row__label">Log out</div>
        </div>
      </Card>
    </div>
  );
}
