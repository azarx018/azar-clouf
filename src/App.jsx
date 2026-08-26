import React, { useEffect, useState } from "react";
import { Cloud, Clock, Settings, Star, Trash2, Search as SearchIcon, MoreVertical, ChevronLeft, FolderPlus, RefreshCw, LogOut } from "lucide-react";
import { useRouter, Route } from "./router/router.jsx";
import { usePageTitleValue } from "./pageTitle.jsx";
import { useTheme } from "./theme.jsx";
import { useAuth } from "./auth/AuthContext.jsx";
import MyCloudPage from "./pages/MyCloudPage.jsx";
import FolderPage from "./pages/FolderPage.jsx";
import FileDetailPage from "./pages/FileDetailPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import RecentPage from "./pages/RecentPage.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";
import TrashPage from "./pages/TrashPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import { IconButton, OfflineBanner, ActionSheet, ErrorState, useSnackbar } from "./components/index.js";
import { getFriendlyErrorMessage } from "./services/errorMessages.js";
import "./App.css";

const NAV_ITEMS = [
  { path: "/", label: "Cloud", icon: Cloud },
  { path: "/recent", label: "Recent", icon: Clock },
  { path: "/settings", label: "Settings", icon: Settings },
];

const SIDEBAR_ITEMS = [
  { path: "/", label: "My Cloud", icon: Cloud },
  { path: "/recent", label: "Recent", icon: Clock },
  { path: "/favorites", label: "Favorites", icon: Star },
  { path: "/trash", label: "Trash", icon: Trash2 },
];

function staticTitleFor(path) {
  const staticTitles = {
    "/search": "Search",
    "/recent": "Recent",
    "/favorites": "Favorites",
    "/trash": "Trash",
    "/settings": "Settings",
    "/upload": "Upload",
  };
  return staticTitles[path] || null;
}

export default function App() {
  const { status, retry } = useAuth();
  const { path, navigate } = useRouter();

  // Startup gate: never render the Cloud UI before the session is validated,
  // so there's no flash of authenticated content before a redirect to Login.
  if (status === "checking") {
    return (
      <div className="auth-loading">
        <Cloud size={28} />
      </div>
    );
  }

  if (status === "check_failed") {
    return (
      <div className="auth-loading">
        <ErrorState
          title="Couldn't connect"
          description="We couldn't verify your session. Check your connection and try again."
          onRetry={retry}
        />
      </div>
    );
  }

  if (status === "unauthenticated") {
    if (path === "/register") {
      return <RegisterPage onNavigateLogin={() => navigate("/login")} />;
    }
    return <LoginPage onNavigateRegister={() => navigate("/register")} />;
  }

  return <CloudShell />;
}

function CloudShell() {
  const { path, navigate, goBack } = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const dynamicTitle = usePageTitleValue();
  const isRoot = path === "/";
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { showSnackbar } = useSnackbar();

  // If we just logged in while sitting on /login or /register, hop back to My Cloud.
  useEffect(() => {
    if (path === "/login" || path === "/register") {
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moreActions = [
    { key: "new-folder", label: "New folder", icon: FolderPlus },
    { key: "refresh", label: "Refresh", icon: RefreshCw },
  ];

  const handleMoreAction = (key) => {
    setMoreMenuOpen(false);
    if (key === "refresh") {
      window.location.reload();
    } else if (key === "new-folder") {
      showSnackbar("New folder — coming soon");
    }
  };

  return (
    <div className="app-root">
      <OfflineBanner />
    <div className="app-shell">
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <Cloud size={20} />
          <span>AzarCloud</span>
        </div>
        <nav className="sidebar__nav">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.path}
              className={`sidebar__item ${path === item.path ? "is-active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button
          className={`sidebar__item ${path === "/settings" ? "is-active" : ""}`}
          onClick={() => navigate("/settings")}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <button className="sidebar__item" onClick={logout}>
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </aside>

      <div className="app-main">
        {/* Compact header */}
        <header className="app-header">
          {isRoot ? (
            <div className="app-header__brand">
              <Cloud size={19} />
              <span>AzarCloud</span>
            </div>
          ) : (
            <button className="app-header__back" onClick={goBack}>
              <ChevronLeft size={20} />
              <span>{dynamicTitle || staticTitleFor(path) || "Back"}</span>
            </button>
          )}
          <div className="app-header__actions">
            {path !== "/search" && (
              <IconButton icon={SearchIcon} label="Search" onClick={() => navigate("/search")} />
            )}
            <IconButton icon={MoreVertical} label="More options" onClick={() => setMoreMenuOpen(true)} />
          </div>
        </header>

        <main className="app-content">
          <Route path="/" component={MyCloudPage} />
          <Route path="/folder/:id" component={FolderPage} />
          <Route path="/file/:id" component={FileDetailPage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/recent" component={RecentPage} />
          <Route path="/favorites" component={FavoritesPage} />
          <Route path="/trash" component={TrashPage} />
          <Route path="/upload" component={UploadPage} />
          <Route path="/settings" component={() => <SettingsPage theme={theme} onToggleTheme={toggleTheme} onLogout={logout} />} />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            className={`bottom-nav__item ${path === item.path ? "is-active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
      <ActionSheet
        open={moreMenuOpen}
        onClose={() => setMoreMenuOpen(false)}
        onAction={handleMoreAction}
        actions={moreActions}
      />
    </div>
  );
}
