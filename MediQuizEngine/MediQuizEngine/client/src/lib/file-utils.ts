export function getFileIcon(mimeType: string): string {
  switch (mimeType) {
    case "application/pdf":
      return "fas fa-file-pdf";
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return "fas fa-file-powerpoint";
    case "text/plain":
      return "fas fa-file-alt";
    case "image/jpeg":
    case "image/png":
    case "image/gif":
      return "fas fa-file-image";
    default:
      return "fas fa-file";
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function validateFileType(file: File): boolean {
  const allowedTypes = [
    "text/plain",
    "application/pdf", 
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/jpeg",
    "image/png", 
    "image/gif",
  ];
  
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
