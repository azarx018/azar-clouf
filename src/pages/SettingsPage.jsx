import React, { useState } from "react";
import { Sun, Moon, LogOut, RefreshCw } from "lucide-react";
import { Card, useSnackbar } from "../components/index.js";
import { APP_VERSION } from "../version.js";
import "./SettingsPage.css";

async function forceUpdate() {
  try {
    const regs = await navigator.serviceWorker?.getRegistrations?.();
    if (regs) await Promise.all(regs.map((r) => r.unregister()));
    const keys = await caches?.keys?.();
    if (keys) await Promise.all(keys.map((k) => caches.delete(k)));
  } finally {
    window.location.reload();
  }
}

export default function SettingsPage({ theme, onToggleTheme, onLogout }) {
  const { showSnackbar } = useSnackbar();
  const [updating, setUpdating] = useState(false);

  const handleForceUpdate = async () => {
    setUpdating(true);
    showSnackbar("Clearing cache and reloading...");
    await forceUpdate();
  };

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

      <Card className="settings-row" onClick={handleForceUpdate}>
        <div className="settings-row__icon">
          <RefreshCw size={18} className={updating ? "settings-row__icon--spin" : ""} />
        </div>
        <div className="settings-row__body">
          <div className="settings-row__label">Force update</div>
          <div className="settings-row__value">Clear cache if the app seems out of date</div>
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

      <div className="settings-version">AzarCloud v{APP_VERSION}</div>
    </div>
  );
}
