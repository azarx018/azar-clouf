import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider } from "./theme.jsx";
import { RouterProvider } from "./router/router.jsx";
import { SnackbarProvider } from "./components/Snackbar.jsx";
import { PageTitleProvider } from "./pageTitle.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { UploadProvider } from "./upload/UploadContext.jsx";
import "./styles/tokens.css";
import "./styles/shared.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider>
        <SnackbarProvider>
          <PageTitleProvider>
            <AuthProvider>
              <UploadProvider>
                <App />
              </UploadProvider>
            </AuthProvider>
          </PageTitleProvider>
        </SnackbarProvider>
      </RouterProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// Register service worker for the offline app shell.
// Auto-reload ONCE when a new service worker takes control, so a fresh
// deploy is never stuck behind an old cached build in an already-open tab.
if ("serviceWorker" in navigator) {
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures shouldn't break the app.
    });
  });
}
