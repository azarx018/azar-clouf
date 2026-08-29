import React, { useEffect, useState } from "react";
import { CloudService } from "../services/CloudService.js";
import { iconForType } from "../utils/fileIcons.js";
import "./Thumbnail.css";

// Module-level cache so navigating between pages (or re-rendering a list)
// doesn't re-fetch the same thumbnail over and over.
const urlCache = new Map();
const inFlight = new Map();

function getThumbnailUrl(fileId) {
  if (urlCache.has(fileId)) return Promise.resolve(urlCache.get(fileId));
  if (inFlight.has(fileId)) return inFlight.get(fileId);

  const promise = CloudService.getThumbnailBlob(fileId)
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      urlCache.set(fileId, url);
      inFlight.delete(fileId);
      return url;
    })
    .catch((err) => {
      inFlight.delete(fileId);
      throw err;
    });

  inFlight.set(fileId, promise);
  return promise;
}

export default function Thumbnail({ file, size = 40, radius = "var(--radius-md)" }) {
  const [url, setUrl] = useState(() => urlCache.get(file.id) || null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!file.hasThumbnail || url || failed) return;
    let cancelled = false;
    getThumbnailUrl(file.id)
      .then((resolvedUrl) => {
        if (!cancelled) setUrl(resolvedUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [file.id, file.hasThumbnail, url, failed]);

  if (!file.hasThumbnail || failed) {
    const Icon = iconForType(file.type);
    return (
      <div className="thumbnail thumbnail--icon" style={{ width: size, height: size, borderRadius: radius }}>
        <Icon size={Math.round(size * 0.42)} />
      </div>
    );
  }

  if (!url) {
    return <div className="thumbnail thumbnail--loading" style={{ width: size, height: size, borderRadius: radius }} />;
  }

  return (
    <img
      src={url}
      alt=""
      className="thumbnail thumbnail--image"
      style={{ width: size, height: size, borderRadius: radius }}
    />
  );
}
