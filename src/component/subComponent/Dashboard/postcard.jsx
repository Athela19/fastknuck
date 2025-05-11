"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ReactPlayer from "react-player";
import { FaUserPlus, FaHeart, FaThumbsDown, FaCommentDots, FaEllipsisH } from "react-icons/fa";

dayjs.extend(relativeTime);

export default function PostCard() {
  const [posts, setPosts] = useState([]);
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(""); // State untuk menyimpan gambar profil
  const [name, setName] = useState(""); // State untuk menyimpan nama pengguna
const [users, setUsers] = useState({}); // Untuk menyimpan data pengguna

const fetchPosts = async () => {
  try {
    const response = await axios.get("/api/post", { withCredentials: true });
    setPosts(response.data);
    
    // Ambil data pengguna untuk semua post
    const userIds = [...new Set(response.data.map(post => post.user_id))];
    const usersResponse = await axios.get("/api/users", { 
      params: { ids: userIds.join(',') },
      withCredentials: true
    });
    
    // Ubah array users menjadi object dengan user_id sebagai key
    const usersMap = usersResponse.data.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
    
    setUsers(usersMap);
  } catch (err) {
    console.error("Gagal memuat postingan:", err);
  }
}; 
  const fetchProfileData = async () => {
    try {
      const response = await axios.get("/api/auth", {
        withCredentials: true,
      });
      setProfilePic(response.data.profile_picture); // Menyimpan URL foto profil
      setName(response.data.name); // Menyimpan nama pengguna
    } catch (err) {
      console.error("Gagal memuat data profil:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!description && !media) {
      setError("Deskripsi atau media wajib diisi.");
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    if (media) formData.append("media", media);

    setLoading(true);
    try {
      await axios.post("/api/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      setDescription("");
      setMedia(null);
      setIsModalOpen(false); // Close modal after posting
      fetchPosts();
    } catch (err) {
      const msg = err?.response?.data?.error || "Gagal mengirim postingan.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isVideo = (url) => {
    return url?.match(/\.(mp4|mkv|webm|ogg)$/i);
  };

  useEffect(() => {
    fetchPosts();
    fetchProfileData(); // Mengambil gambar profil dan nama pengguna ketika komponen dimuat
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 bg-gray-200 mt-16">
      {/* Tombol Foto Profil dengan Background Grey */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-xl hover:bg-gray-100"
      >
        <img
          src={profilePic || "/profile.jpg"}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="flex-1 text-base text-gray-400 border border-gray-200 rounded-full px-5 py-2 bg-gray-200">
          Apa yang kamu pikirin, {name}?
        </span>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="relative bg-white p-6 rounded-xl w-full max-w-md mx-4 shadow-lg">
            {/* Tombol Tutup */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
            >
              &times;
            </button>

            {/* Foto Profil dan Nama */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={profilePic || "/profile.jpg"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <p className="font-semibold">{name}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                placeholder="Tulis sesuatu..."
                className="w-full p-2 bg-gray-100 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {/* Drag & Drop Area */}
              <div className="space-y-2">
                <label
                  htmlFor="mediaInput"
                  className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-4 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) setMedia(file);
                  }}
                >
                  {media ? (
                    <div className="relative w-full">
                      {/* Tombol Aksi */}
                      <div className="absolute top-2 right-2 flex space-x-2 z-10">
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById("mediaInput")?.click()
                          }
                          className="bg-white text-blue-500 hover:text-blue-700 rounded-full p-1 shadow"
                          title="Change File"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M15.232 5.232l3.536 3.536M9 11l3.536-3.536a2 2 0 012.828 0l.707.707a2 2 0 010 2.828L12 14l-3 1 1-3z" />
                            <path d="M16 17h2v2H5V5h2" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMedia(null)}
                          className="bg-white text-red-500 hover:text-red-700 rounded-full p-1 shadow"
                          title="Remove File"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Preview */}
                      {media.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(media)}
                          alt="Preview"
                          className="max-h-40 mb-2 rounded object-contain w-full"
                        />
                      ) : (
                        <div className="bg-gray-100 p-4 rounded mb-2">
                          <p className="text-blue-600">Video file selected</p>
                        </div>
                      )}
                      <p className="text-sm text-gray-600">{media.name}</p>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="w-8 h-8 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-center">
                        <span className="text-blue-500 font-medium">
                          Klik untuk Upload
                        </span>{" "}
                        atau seret dan letakkan
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF , MKV or MP4
                      </p>
                    </>
                  )}
                </label>

                <input
                  id="mediaInput"
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && setMedia(e.target.files[0])
                  }
                />
              </div>

              {/* Error */}
              {error && <p className="text-red-600 text-sm">{error}</p>}

              {/* Tombol Submit */}
              <button
                type="submit"
                disabled={loading || (!description && !media)}
                className={`w-full py-2 rounded text-white font-medium transition-colors ${
                  description || media
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

<div className="space-y-6">
  {posts.map((post) => {
    const user = users[post.user_id] || {};
    return (
      <div
        key={post.id}
        className="bg-white rounded-xl shadow-md p-4 space-y-3 transition-transform hover:scale-[1.005]"
      >
        {/* Header Postingan */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.profile_url || '/profile.jpg'}
              alt={user.name || 'User'}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
            <div>
              <p className="font-semibold text-gray-800">{user.name || 'Pengguna'}</p>
              <p className="text-xs text-gray-500">
                {dayjs(post.created_at).format('D MMM YYYY [pukul] HH:mm')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-blue-600 text-sm flex items-center gap-1 hover:underline hover:text-blue-700 transition-colors">
              <FaUserPlus className="text-sm" />
              <span className="hidden md:inline">Ikuti</span>
            </button>
            <button className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
              <FaEllipsisH />
            </button>
          </div>
        </div>

        {/* Konten Postingan */}
        <div className="space-y-3">
          <p className="text-gray-800 whitespace-pre-line">{post.description}</p>

          {post.media_url && (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              {isVideo(post.media_url) ? (
                <ReactPlayer
                  url={post.media_url}
                  controls
                  width="100%"
                  height="auto"
                  style={{ maxHeight: "500px" }}
                />
              ) : (
                <img
                  src={post.media_url}
                  alt="media"
                  className="w-full max-h-[500px] object-contain"
                />
              )}
            </div>
          )}
        </div>

        {/* Aksi Interaksi */}
        <div className="flex items-center justify-between border-t pt-3 text-gray-600">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
              <FaHeart />
              <span>Suka</span>
            </button>
            <button className="flex items-center gap-1 hover:text-yellow-500 transition-colors">
              <FaThumbsDown />
              <span>Tidak Suka</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <FaCommentDots />
              <span>Komentar</span>
            </button>
          </div>
          <span className="text-sm text-gray-400">
            {post.likes_count || 0} suka • {post.comments_count || 0} komentar
          </span>
        </div>
      </div>
    );
  })}
</div>

    </div>
  );
}
