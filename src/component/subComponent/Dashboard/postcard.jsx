"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ReactPlayer from "react-player";
import {
  FaUserPlus,
  FaHeart,
  FaCommentDots,
  FaEllipsisH,
  FaTimes,
  FaExchangeAlt,
  FaUpload,
} from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";

dayjs.extend(relativeTime);

// Constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const VALID_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-matroska",
];

export default function PostCard() {
  // State
  const [state, setState] = useState({
    posts: [],
    description: "",
    media: null,
    loading: false,
    error: "",
    isModalOpen: false,
    profilePic: "/profile.jpg",
    name: "",
    users: {},
    likedPosts: {},
    commentInputs: {},
    comments: {},
  });

  // Derived state
  const {
    posts,
    description,
    media,
    loading,
    error,
    isModalOpen,
    profilePic,
    name,
    users,
    likedPosts,
    commentInputs,
    comments,
  } = state;

  // Memoized values
  const isSubmitDisabled = useMemo(
    () => !description && !media,
    [description, media]
  );

  // API Calls
  const fetchProfileData = useCallback(async () => {
    try {
      const response = await axios.get("/api/auth", { withCredentials: true });
      setState((prev) => ({
        ...prev,
        profilePic: response.data.profile_picture || "/profile.jpg",
        name: response.data.name || "Teman",
      }));
    } catch (err) {
      console.error("Gagal memuat data profil:", err);
    }
  }, []);

  const fetchLikesStatus = useCallback(async (posts) => {
    try {
      const response = await axios.get("/api/post/likes", {
        withCredentials: true,
      });

      const likesMap = {};
      const commentsMap = {};

      response.data.forEach((item) => {
        likesMap[item.post_id] = parseInt(item.like_count) || 0;
        commentsMap[item.post_id] = parseInt(item.comment_count) || 0;
      });

      return posts.map((post) => ({
        ...post,
        likes_count: likesMap[post.id] || 0,
        comments_count: commentsMap[post.id] || 0,
      }));
    } catch (err) {
      console.error("Gagal memuat status like:", err);
      return posts;
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await axios.get("/api/post", { withCredentials: true });
      const postsWithLikesAndComments = await fetchLikesStatus(response.data);

      const userIds = [...new Set(response.data.map((post) => post.user_id))];
      let usersMap = {};

      if (userIds.length > 0) {
        const usersResponse = await axios.get("/api/users", {
          params: { ids: userIds.join(",") },
          withCredentials: true,
        });

        usersMap = usersResponse.data.reduce((acc, user) => {
          acc[user.id] = {
            ...user,
            profile_url: user.profile_picture || "/profile.jpg",
            name: user.name || "Pengguna",
          };
          return acc;
        }, {});
      }

      setState((prev) => ({
        ...prev,
        posts: postsWithLikesAndComments,
        users: usersMap,
      }));
    } catch (err) {
      console.error("Gagal memuat postingan:", err);
    }
  }, [fetchLikesStatus]);

  // Effects
  useEffect(() => {
    fetchPosts();
    fetchProfileData();
  }, [fetchPosts, fetchProfileData]);

  // Helpers
  const validateFile = (file) => {
    if (!file) return false;

    if (file.size > MAX_FILE_SIZE) {
      setState((prev) => ({
        ...prev,
        error: "Ukuran file terlalu besar. Maksimal 50MB.",
      }));
      return false;
    }

    if (!VALID_FILE_TYPES.includes(file.type)) {
      setState((prev) => ({
        ...prev,
        error:
          "Format file tidak didukung. Gunakan gambar (JPEG, PNG, GIF) atau video (MP4, WebM, OGG, MKV).",
      }));
      return false;
    }

    return true;
  };

  const isVideo = (url) => {
    return (
      url?.match(/\.(mp4|webm|ogg|mov|mkv)$/i) ||
      url?.includes("video") ||
      url?.startsWith("blob:")
    );
  };

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description && !media) {
      setState((prev) => ({
        ...prev,
        error: "Deskripsi atau media wajib diisi.",
      }));
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    if (media) formData.append("media", media);

    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      await axios.post("/api/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setState((prev) => ({
        ...prev,
        description: "",
        media: null,
        isModalOpen: false,
      }));

      await fetchPosts();
    } catch (err) {
      const msg = err?.response?.data?.error || "Gagal mengirim postingan.";
      setState((prev) => ({ ...prev, error: msg }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleFileChange = (file) => {
    if (validateFile(file)) {
      setState((prev) => ({ ...prev, media: file, error: "" }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    handleFileChange(file);
  };

  const handleLike = async (postId) => {
    try {
      const isLiked = likedPosts[postId];

      // Optimistic update
      setState((prev) => ({
        ...prev,
        likedPosts: { ...prev.likedPosts, [postId]: !isLiked },
        posts: prev.posts.map((post) => ({
          ...post,
          likes_count:
            post.id === postId
              ? isLiked
                ? post.likes_count - 1
                : post.likes_count + 1
              : post.likes_count,
        })),
      }));

      const response = await axios[isLiked ? "delete" : "post"](
        `/api/post/${postId}/like`,
        {},
        { withCredentials: true }
      );

      // Final update
      setState((prev) => ({
        ...prev,
        posts: prev.posts.map((post) => ({
          ...post,
          likes_count:
            post.id === postId
              ? response.data.likes_count || post.likes_count
              : post.likes_count,
        })),
      }));
    } catch (err) {
      console.error("Gagal menyukai postingan:", err);
      // Rollback
      setState((prev) => ({
        ...prev,
        likedPosts: { ...prev.likedPosts, [postId]: !prev.likedPosts[postId] },
        posts: prev.posts.map((post) => ({
          ...post,
          likes_count:
            post.id === postId
              ? likedPosts[postId]
                ? post.likes_count + 1
                : post.likes_count - 1
              : post.likes_count,
        })),
      }));
    }
  };

  const handleCommentSubmit = async (postId) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return;

    try {
      const response = await axios.post(
        `/api/post/${postId}/comment`,
        { content: comment },
        { withCredentials: true }
      );

      setState((prev) => ({
        ...prev,
        comments: {
          ...prev.comments,
          [postId]: [...(prev.comments[postId] || []), response.data],
        },
        commentInputs: { ...prev.commentInputs, [postId]: "" },
        posts: prev.posts.map((post) => ({
          ...post,
          comments_count:
            post.id === postId ? (post.comments_count || 0) + 1 : post.comments_count,
        })),
      }));
    } catch (err) {
      console.error("Gagal mengirim komentar:", err);
    }
  };

  // Component rendering
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

  const renderPostHeader = (post, user) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={user.profile_url}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover border border-gray-200"
          loading="lazy"
        />
        <div>
          <p className="font-semibold text-gray-800">{user.name}</p>
          <p className="text-xs text-gray-500">
            {dayjs(post.created_at).fromNow()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="text-blue-600 text-sm flex items-center gap-1 hover:underline hover:text-blue-700 transition-colors"
          aria-label="Ikuti pengguna"
        >
          <FaUserPlus />
          <span className="hidden sm:inline">Ikuti</span>
        </button>
        <button
          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Menu lainnya"
        >
          <FaEllipsisH />
        </button>
      </div>
    </div>
  );

  const renderPostMedia = (post) => {
    if (!post.media_url) return null;

    return (
      <div className="rounded-lg overflow-hidden border border-gray-200 mt-3">
        {isVideo(post.media_url) ? (
          <div className="relative pt-[56.25%]">
            <ReactPlayer
              url={post.media_url}
              controls
              width="100%"
              height="100%"
              style={{ position: "absolute", top: 0, left: 0 }}
              playsinline
              config={{
                file: {
                  attributes: {
                    controlsList: "nodownload",
                    playsInline: true,
                  },
                },
              }}
            />
          </div>
        ) : (
          <img
            src={post.media_url}
            alt="Media postingan"
            className="w-full max-h-[500px] object-contain"
            loading="lazy"
          />
        )}
      </div>
    );
  };

  const renderPostActions = (post) => (
    <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-gray-600">
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleLike(post.id)}
          className={`flex items-center gap-1.5 transition-colors ${
            likedPosts[post.id] ? "text-red-500" : "hover:text-red-500"
          }`}
          aria-label="Suka postingan"
        >
          <FaHeart className={likedPosts[post.id] ? "fill-current" : ""} />
          <span className="text-sm">Suka</span>
        </button>
        <button
          className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
          aria-label="Beri komentar"
        >
          <FaCommentDots />
          <span className="text-sm">Komentar</span>
        </button>
      </div>
      <span className="text-sm text-gray-400">
        {post.likes_count || 0} suka • {post.comments_count || 0} komentar
      </span>
    </div>
  );

  const renderCommentSection = (post) => (
    <div className="mt-3 space-y-3">
      <div className="flex gap-2">
        <img
          src={profilePic}
          alt="Profil Anda"
          className="w-8 h-8 rounded-full object-cover"
          loading="lazy"
        />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Tulis komentar..."
            className="flex-1 text-sm bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={commentInputs[post.id] || ""}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                commentInputs: {
                  ...prev.commentInputs,
                  [post.id]: e.target.value,
                },
              }))
            }
            onKeyPress={(e) =>
              e.key === "Enter" && handleCommentSubmit(post.id)
            }
            aria-label="Komentar"
          />
          <button
            onClick={() => handleCommentSubmit(post.id)}
            className="text-blue-500 font-medium text-sm px-3"
            disabled={!commentInputs[post.id]?.trim()}
          >
            Kirim
          </button>
        </div>
      </div>

      {(comments[post.id] || []).map((comment) => (
        <div key={comment.id} className="flex gap-2">
          <img
            src={comment.user?.profile_picture || "/profile.jpg"}
            alt={comment.user?.name}
            className="w-8 h-8 rounded-full object-cover"
            loading="lazy"
          />
          <div className="flex-1 bg-gray-100 rounded-lg p-3">
            <p className="font-semibold text-sm">{comment.user?.name}</p>
            <p className="text-sm mt-1">{comment.content}</p>
            <p className="text-xs text-gray-500 mt-1">
              {dayjs(comment.created_at).fromNow()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 bg-gray-200 mt-16">
      {/* Create Post Button */}
      <div
        onClick={() => setState((prev) => ({ ...prev, isModalOpen: true }))}
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

      {/* Create Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
              <h3 className="font-semibold text-lg">Buat Postingan</h3>
              <button
                onClick={() =>
                  setState((prev) => ({ ...prev, isModalOpen: false }))
                }
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Tutup modal"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* Modal Content */}
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
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, description: e.target.value }))
                  }
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
                      {media?.type.startsWith("video/")
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

      {/* Posts List */}
      <div className="space-y-5">
        {posts.map((post) => {
          const user = users[post.user_id] || {};
          return (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-sm p-4 space-y-4"
            >
              {renderPostHeader(post, user)}

              <div className="space-y-4">
                {post.description && (
                  <p className="text-gray-800 whitespace-pre-line">
                    {post.description}
                  </p>
                )}

                {renderPostMedia(post)}
              </div>

              {renderPostActions(post)}
              {renderCommentSection(post)}
            </article>
          );
        })}
      </div>
    </div>
  );
}