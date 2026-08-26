import React from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus.js";
import "./OfflineBanner.css";

export default function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div className="offline-banner" role="status">
      <WifiOff size={14} />
      <span>You're offline. Upload and download require an internet connection.</span>
    </div>
  );
}
