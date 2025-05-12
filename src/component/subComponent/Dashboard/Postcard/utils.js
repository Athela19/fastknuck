export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const VALID_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-matroska",
];

export const validateFile = (file) => {
  if (!file) return false;

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "Ukuran file terlalu besar. Maksimal 50MB." };
  }

  if (!VALID_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error:
        "Format file tidak didukung. Gunakan gambar (JPEG, PNG, GIF) atau video (MP4, WebM, OGG, MKV).",
    };
  }

  return { valid: true };
};

export const isVideo = (url) => {
  return (
    url?.match(/\.(mp4|webm|ogg|mov|mkv)$/i) ||
    url?.includes("video") ||
    url?.startsWith("blob:")
  );
};