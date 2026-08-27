import React, { useEffect, useState } from "react";
import { Folder, Check } from "lucide-react";
import Dialog from "./Dialog.jsx";
import Button from "./Button.jsx";
import { CloudService } from "../services/CloudService.js";
import { getFriendlyErrorMessage } from "../services/errorMessages.js";
import "./PromptDialog.css";

export default function MoveDialog({ target, onCancel, onSubmit }) {
  const [folders, setFolders] = useState([]);
  const [selected, setSelected] = useState("root");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!target) return;
    setSelected(target.folderId || "root");
    setLoading(true);
    setError(null);
    CloudService.getSubfolders("root")
      .then(setFolders)
      .catch((err) => setError(getFriendlyErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [target]);

  const submit = () => onSubmit(selected);

  return (
    <Dialog open={!!target} title={target ? `Move "${target.name}"` : ""} onClose={onCancel}>
      <div className="prompt-dialog__content">
        {loading && <div className="prompt-dialog__hint">Loading folders...</div>}
        {error && <div className="prompt-dialog__hint prompt-dialog__hint--error">{error}</div>}

        {!loading && !error && (
          <div className="prompt-dialog__list">
            <button
              className={`prompt-dialog__option ${selected === "root" ? "is-selected" : ""}`}
              onClick={() => setSelected("root")}
            >
              <Folder size={16} />
              <span>Root</span>
              {selected === "root" && <Check size={16} className="prompt-dialog__check" />}
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                className={`prompt-dialog__option ${selected === folder.id ? "is-selected" : ""}`}
                onClick={() => setSelected(folder.id)}
              >
                <Folder size={16} />
                <span>{folder.name}</span>
                {selected === folder.id && <Check size={16} className="prompt-dialog__check" />}
              </button>
            ))}
          </div>
        )}

        <div className="prompt-dialog__buttons">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={submit} disabled={loading || !!error}>Move</Button>
        </div>
      </div>
    </Dialog>
  );
}
