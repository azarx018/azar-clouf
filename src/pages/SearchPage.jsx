import React, { useState } from "react";
import { Card, SearchInput, Dialog, ActionSheet, Button, EmptyState, ErrorState, Skeleton } from "../components/index.js";
import FileRow from "../components/FileRow.jsx";
import { useFileActions } from "../hooks/useFileActions.js";
import { useAsync } from "../hooks/useAsync.js";
import { useRouter } from "../router/router.jsx";
import { CloudService } from "../services/CloudService.js";
import "./SearchPage.css";

const TYPE_FILTERS = ["all", "zip", "apk", "pdf", "doc"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const { navigate } = useRouter();
  const { menuFile, openMenu, closeMenu, handleAction, deleteTarget, confirmDelete, cancelDelete } = useFileActions();

  const { data: allResults, loading, error, reload } = useAsync(
    () => (query ? CloudService.searchFiles(query) : Promise.resolve([])),
    [query]
  );

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

      {query && error && <ErrorState onRetry={reload} />}

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
    </div>
  );
}
