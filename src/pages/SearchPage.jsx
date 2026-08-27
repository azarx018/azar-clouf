import React, { useEffect, useState } from "react";
import { Card, SearchInput, Dialog, ActionSheet, Button, EmptyState, ErrorState, Skeleton, RenameDialog, MoveDialog } from "../components/index.js";
import FileRow from "../components/FileRow.jsx";
import { useFileActions } from "../hooks/useFileActions.js";
import { useAsync } from "../hooks/useAsync.js";
import { useRouter } from "../router/router.jsx";
import { CloudService } from "../services/CloudService.js";
import { getFriendlyErrorMessage } from "../services/errorMessages.js";
import "./SearchPage.css";

const TYPE_FILTERS = ["all", "zip", "apk", "pdf", "doc"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const { navigate } = useRouter();

  // Debounce so we don't hit GET /api/search on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: allResults, loading, error, reload } = useAsync(
    () => (debouncedQuery ? CloudService.searchFiles(debouncedQuery) : Promise.resolve([])),
    [debouncedQuery]
  );

  const {
    menuFile, openMenu, closeMenu, handleAction,
    deleteTarget, confirmDelete, cancelDelete,
    renameTarget, submitRename, cancelRename,
    moveTarget, submitMove, cancelMove,
  } = useFileActions({
    onDeleted: reload,
    onFavoriteChanged: reload,
    onChanged: reload,
  });

  const results = (allResults || []).filter((f) => typeFilter === "all" || f.type === typeFilter);

  return (
    <div className="search-page">
      <SearchInput value={query} onChange={setQuery} onClear={() => setQuery("")} />

      {query && (
        <div className="search-page__filters">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              className={`search-page__filter ${typeFilter === t ? "is-active" : ""}`}
              onClick={() => setTypeFilter(t)}
            >
              {t === "all" ? "All types" : t.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {!query && (
        <EmptyState title="Search your cloud" description="Find files by name, type, or folder." />
      )}

      {query && error && <ErrorState description={getFriendlyErrorMessage(error)} onRetry={reload} />}

      {query && !error && loading && (
        <Card className="file-list">
          <div style={{ padding: "var(--space-2) 0", display: "flex", flexDirection: "column", gap: 12 }}>
            <Skeleton height={14} width="55%" />
            <Skeleton height={14} width="35%" />
          </div>
        </Card>
      )}

      {query && !error && !loading && results.length === 0 && (
        <EmptyState title="No files found" description={`Nothing matches "${query}".`} />
      )}

      {query && !error && !loading && results.length > 0 && (
        <>
          <div className="search-page__count">{results.length} file{results.length === 1 ? "" : "s"} found</div>
          <Card className="file-list">
            {results.map((file) => (
              <FileRow
                key={file.id}
                file={file}
                metaExtra={file.folderName}
                onOpen={(f) => navigate(`/file/${f.id}`)}
                onMenu={openMenu}
              />
            ))}
          </Card>
        </>
      )}

      <ActionSheet open={!!menuFile} fileName={menuFile?.name} onClose={closeMenu} onAction={handleAction} />
      <Dialog
        open={!!deleteTarget}
        title={deleteTarget ? `Delete "${deleteTarget.name}"?` : ""}
        description="This file will be removed from your cloud."
        onClose={cancelDelete}
      >
        <Button variant="secondary" onClick={cancelDelete}>Cancel</Button>
        <Button variant="danger" onClick={confirmDelete}>Delete</Button>
      </Dialog>
      <RenameDialog target={renameTarget} onCancel={cancelRename} onSubmit={submitRename} />
      <MoveDialog target={moveTarget} onCancel={cancelMove} onSubmit={submitMove} />
    </div>
  );
}
