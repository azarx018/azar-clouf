import React, { createContext, useCallback, useContext, useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import "./Snackbar.css";

const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showSnackbar = useCallback((message, { tone = "success", duration = 2400 } = {}) => {
    setToast({ message, tone });
    window.clearTimeout(showSnackbar._t);
    showSnackbar._t = window.setTimeout(() => setToast(null), duration);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {toast && (
        <div className="snackbar" role="status">
          {toast.tone === "error" ? <AlertCircle size={15} /> : <Check size={15} />}
          <span>{toast.message}</span>
        </div>
      )}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used within SnackbarProvider");
  return ctx;
}
