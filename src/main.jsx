import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider } from "./theme.jsx";
import { RouterProvider } from "./router/router.jsx";
import { SnackbarProvider } from "./components/Snackbar.jsx";
import { PageTitleProvider } from "./pageTitle.jsx";
import "./styles/tokens.css";
import "./styles/shared.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider>
        <SnackbarProvider>
          <PageTitleProvider>
            <App />
          </PageTitleProvider>
        </SnackbarProvider>
      </RouterProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// Register service worker for the offline app shell.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures shouldn't break the app.
    });
  });
}
