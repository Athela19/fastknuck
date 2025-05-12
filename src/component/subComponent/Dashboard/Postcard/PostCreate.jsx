"use client";

import { useState, useMemo } from "react";
import { ImSpinner8 } from "react-icons/im";
import { FaTimes, FaExchangeAlt, FaUpload } from "react-icons/fa";
import axios from "axios";

// === Constants & Utils ===
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
  if (!file) return { valid: false, error: "File tidak ditemukan." };

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

// === Component ===
export default function PostCreate({ profilePic, name, isModalOpen, onModalToggle, onPostCreated }) {
  const [state, setState] = useState({
    description: "",
    media: null,
    loading: false,
    error: "",
  });

  const { description, media, loading, error } = state;
  const isSubmitDisabled = useMemo(() => !description && !media, [description, media]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description && !media) {
      setState((prev) => ({ ...prev, error: "Deskripsi atau media wajib diisi." }));
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    if (media) formData.append("media", media);

    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      await axios.post("/api/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setState({ description: "", media: null, loading: false, error: "" });
      onPostCreated();
      onModalToggle(false);
    } catch (err) {
      const msg = err?.response?.data?.error || "Gagal mengirim postingan.";
      setState((prev) => ({ ...prev, error: msg, loading: false }));
    }
  };

  const handleFileChange = (file) => {
    const result = validateFile(file);
    if (result.valid) {
      setState((prev) => ({ ...prev, media: file, error: "" }));
    } else {
      setState((prev) => ({ ...prev, media: null, error: result.error }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    handleFileChange(file);
  };

  const renderMediaPreview = () => {
    if (!media) return null;

    return media.type.startsWith("image/") ? (
      <div className="relative">
        <img
          src={URL.createObjectURL(media)}
          alt="Preview"
          className="max-h-60 w-full object-contain rounded-lg mb-2"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            type="button"
            onClick={() => document.getElementById("mediaInput")?.click()}
            className="bg-white/90 p-1.5 rounded-full shadow-md hover:bg-white transition-colors"
            aria-label="Ganti media"
          >
            <FaExchangeAlt className="text-blue-600 text-sm" />
          </button>
          <button
            type="button"
            onClick={() => setState((prev) => ({ ...prev, media: null }))}
            className="bg-white/90 p-1.5 rounded-full shadow-md hover:bg-white transition-colors"
            aria-label="Hapus media"
          >
            <FaTimes className="text-red-600 text-sm" />
          </button>
        </div>
      </div>
    ) : (
      <div className="bg-gray-100 p-3 rounded-lg mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <FaUpload className="text-blue-600" />
          </div>
          <div>
            <p className="text-blue-600 font-medium text-sm">
              {media.name} ({(media.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Video siap diupload - {media.type.split("/")[1].toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderFileUploadArea = () => (
    <label
      htmlFor="mediaInput"
      className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.classList.add("border-blue-500", "bg-blue-50");
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
        handleDrop(e);
      }}
    >
      {media ? (
        renderMediaPreview()
      ) : (
        <>
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <FaUpload className="text-blue-500 text-xl" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            <span className="text-blue-600">Klik untuk upload</span> atau seret dan lepas
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Format: JPG, PNG, GIF, MP4, WebM (maks. 50MB)
          </p>
        </>
      )}
      <input
        id="mediaInput"
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0])}
      />
    </label>
  );

  return (
    <>
      <div
        onClick={() => onModalToggle(true)}
        className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        aria-label="Buat postingan baru"
      >
        <img
          src={profilePic}
          alt="Profil Anda"
          className="w-10 h-10 rounded-full object-cover"
          loading="lazy"
        />
        <span className="flex-1 text-gray-500 bg-gray-100 rounded-full px-4 py-2 text-left hover:bg-gray-200 transition-colors">
          Apa yang Anda pikirkan, {name || "teman"}?
        </span>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
              <h3 className="font-semibold text-lg">Buat Postingan</h3>
              <button
                onClick={() => onModalToggle(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Tutup modal"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={profilePic}
                  alt="Profil Anda"
                  className="w-10 h-10 rounded-full object-cover"
                  loading="lazy"
                />
                <p className="font-semibold">{name}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  placeholder="Apa yang ingin Anda bagikan?"
                  className="w-full p-3 text-gray-800 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent resize-none"
                  rows={4}
                  value={description}
                  onChange={(e) => setState((prev) => ({ ...prev, description: e.target.value }))}
                  aria-label="Deskripsi postingan"
                />

                {renderFileUploadArea()}

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || isSubmitDisabled}
                  className={`w-full py-2.5 rounded-lg font-medium text-white transition-colors flex items-center justify-center ${
                    isSubmitDisabled
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <ImSpinner8 className="animate-spin mr-2" />
                      {media?.type?.startsWith("video/")
                        ? "Mengunggah video..."
                        : "Mengirim..."}
                    </>
                  ) : (
                    "Posting"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
