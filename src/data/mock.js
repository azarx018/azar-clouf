export const storage = {
  usedBytes: 2.4 * 1024 * 1024 * 1024,
  totalBytes: 5 * 1024 * 1024 * 1024,
  fileCount: 42,
};

// Folder tree. "root" is the top-level My Cloud view.
export const folderTree = {
  root: { id: "root", name: "My Cloud", parentId: null },
  f1: { id: "f1", name: "Projects", parentId: "root" },
  f1a: { id: "f1a", name: "Android", parentId: "f1" },
  f1b: { id: "f1b", name: "Web", parentId: "f1" },
  f2: { id: "f2", name: "APK", parentId: "root" },
  f3: { id: "f3", name: "Documents", parentId: "root" },
  f4: { id: "f4", name: "Backups", parentId: "root" },
};

export const filesByFolder = {
  root: [
    { id: "file1", name: "LifeHub.zip", type: "zip", size: "482 MB", uploaded: "25 Aug 2026" },
    { id: "file2", name: "OurSystem.apk", type: "apk", size: "38 MB", uploaded: "24 Aug 2026" },
    { id: "file3", name: "Notes.pdf", type: "pdf", size: "4.2 MB", uploaded: "23 Aug 2026" },
  ],
  f1: [
    { id: "file4", name: "backup.zip", type: "zip", size: "120 MB", uploaded: "18 Aug 2026" },
    { id: "file5", name: "README.md", type: "doc", size: "2 KB", uploaded: "20 Aug 2026" },
  ],
  f1a: [
    { id: "file6", name: "release-build.apk", type: "apk", size: "41 MB", uploaded: "12 Aug 2026" },
  ],
  f1b: [
    { id: "file7", name: "index.html", type: "doc", size: "6 KB", uploaded: "10 Aug 2026" },
  ],
  f2: [
    { id: "file8", name: "OurSystem-v2.apk", type: "apk", size: "39 MB", uploaded: "22 Aug 2026" },
  ],
  f3: [
    { id: "file9", name: "Notes.pdf", type: "pdf", size: "4.2 MB", uploaded: "23 Aug 2026" },
    { id: "file10", name: "Invoice-August.pdf", type: "pdf", size: "310 KB", uploaded: "5 Aug 2026" },
  ],
  f4: [],
};

export const favoriteFileIds = ["file1", "file9"];
export const trashedFiles = [
  { id: "tfile1", name: "old-draft.docx", type: "doc", size: "1.1 MB", deleted: "20 Aug 2026" },
];

export function getSubfolders(parentId) {
  return Object.values(folderTree).filter((f) => f.parentId === parentId);
}

export function getFolder(id) {
  return folderTree[id] || null;
}

export function getBreadcrumb(id) {
  const chain = [];
  let cur = folderTree[id];
  while (cur) {
    chain.unshift(cur);
    cur = cur.parentId ? folderTree[cur.parentId] : null;
  }
  return chain;
}

export function getFilesIn(folderId) {
  return filesByFolder[folderId] || [];
}

export function getFile(id) {
  for (const [folderId, list] of Object.entries(filesByFolder)) {
    const found = list.find((f) => f.id === id);
    if (found) return { ...found, folderId, folderName: folderTree[folderId]?.name };
  }
  return null;
}

export function searchFiles(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results = [];
  for (const [folderId, list] of Object.entries(filesByFolder)) {
    list.forEach((f) => {
      if (f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q)) {
        results.push({ ...f, folderId, folderName: folderTree[folderId]?.name });
      }
    });
  }
  return results;
}

// Backward-compatible aliases used by MyCloudPage
export const folders = getSubfolders("root");
export const recentFiles = filesByFolder.root;
