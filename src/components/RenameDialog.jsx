import React, { useEffect, useState } from "react";
import Dialog from "./Dialog.jsx";
import Button from "./Button.jsx";
import { Input } from "./Input.jsx";
import "./PromptDialog.css";

export default function RenameDialog({ target, onCancel, onSubmit }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (target) setValue(target.name || "");
  }, [target]);

  const trimmed = value.trim();
  const submit = () => {
    if (!trimmed || trimmed === target?.name) return;
    onSubmit(trimmed);
  };

  return (
    <Dialog open={!!target} title={target ? `Rename "${target.name}"` : ""} onClose={onCancel}>
      <div className="prompt-dialog__content">
        <Input value={value} onChange={setValue} placeholder="File name" />
        <div className="prompt-dialog__buttons">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={submit} disabled={!trimmed || trimmed === target?.name}>Save</Button>
        </div>
      </div>
    </Dialog>
  );
}
