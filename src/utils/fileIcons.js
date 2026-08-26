import { Package, Smartphone, FileText, Image, Video, Music, Code, File } from "lucide-react";

export const FILE_ICONS = {
  zip: Package,
  apk: Smartphone,
  pdf: FileText,
  doc: FileText,
  image: Image,
  video: Video,
  audio: Music,
  code: Code,
};

export function iconForType(type) {
  return FILE_ICONS[type] || File;
}
