'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState({});
  const [fullscreenMedia, setFullscreenMedia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fullPreview, setFullPreview] = useState(null);

  useEffect(() => {
    fetch('/api/post')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        data.forEach((post) => {
          if (!authors[post.user_id]) {
            fetch(`/api/auth/${post.user_id}`)
              .then((res) => res.json())
              .then((authorData) =>
                setAuthors((prev) => ({ ...prev, [post.user_id]: authorData })));
          }
        });
      });
  }, [authors]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp',
      'video/mp4', 'video/mkv'
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Hanya file JPEG, PNG, WEBP, MP4, dan MKV yang diizinkan');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Ukuran file maksimal 10MB');
      return;
    }

    setError("");
    setFile(selectedFile);
    const fileUrl = URL.createObjectURL(selectedFile);
    setPreview(fileUrl);
    setFullPreview(fileUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      if (file) {
        formData.append("media", file);
      }
      formData.append("description", description);

      const res = await fetch("/api/post", {
        method: "POST",
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal membuat post');
      }

      const data = await res.json();
      alert("Post berhasil dibuat!");
      setFile(null);
      setPreview(null);
      setDescription("");
      setIsModalOpen(false);
      
      // Refresh posts
      const postsRes = await fetch('/api/post');
      const postsData = await postsRes.json();
      setPosts(postsData);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);

      if (err.message.includes('Unauthorized') || err.message.includes('token')) {
        window.location.href = '/Auth';
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 pt-16 pb-20">
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t flex justify-around items-center py-3 z-40">
        <button className="flex flex-col items-center text-gray-600">
          <span>🏠</span>
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center text-gray-600">
          <span>🔍</span>
          <span className="text-xs">Search</span>
        </button>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center text-blue-500"
        >
          <span className="text-2xl">+</span>
          <span className="text-xs">Create</span>
        </button>
        <button className="flex flex-col items-center text-gray-600">
          <span>💬</span>
          <span className="text-xs">Messages</span>
        </button>
        <button className="flex flex-col items-center text-gray-600">
          <span>👤</span>
          <span className="text-xs">Profile</span>
        </button>
      </div>


      <div className="md:grid md:grid-cols-4 md:gap-6 px-4">
        {/* Sidebars - Hidden on mobile */}
        <aside className="hidden md:block md:col-span-1 bg-white p-4 rounded-xl shadow-sm h-fit sticky top-6">
          <h2 className="text-lg font-semibold mb-4">Menu</h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li><a href="#" className="hover:underline">Home</a></li>
            <li><a href="#" className="hover:underline">Discover</a></li>
            <li><a href="#" className="hover:underline">Notifications</a></li>
          </ul>
        </aside>

        {/* Main Content - Full width on mobile */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {posts.map((post) => {
            const isVideo = post.media_url?.endsWith('.mp4') || post.media_url?.endsWith('.webm');
            const author = authors[post.user_id];

            return (
              <div
                key={post.id}
                className="w-full bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Author info */}
                <div className="p-3 flex items-center gap-2 border-b">
                  {author && author.profile_picture ? (
                    <Image
                      src={author.profile_picture}
                      alt={author.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="text-gray-600 text-sm" />
                    </div>
                  )}
                  <span className="font-medium text-sm">{author?.name || 'Unknown'}</span>
                </div>

                <div className="p-3">
                  <p className="text-sm text-gray-800 mb-2">{post.description}</p>
                </div>

                {post.media_url && (
                  <div className="w-full bg-black">
                    {isVideo ? (
                      <video
                        controls
                        className="w-full"
                        onClick={() => setFullscreenMedia(post)}
                      >
                        <source src={post.media_url} type="video/mp4" />
                      </video>
                    ) : (
                      <Image
                        src={post.media_url}
                        alt="media"
                        width={600}
                        height={600}
                        className="w-full object-cover cursor-pointer"
                        onClick={() => setFullscreenMedia(post)}
                      />
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex justify-between items-center px-3 py-2 border-t text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1 hover:text-blue-600 transition">
                      <span className="text-lg">👍</span>
                      <span className="text-xs hidden md:inline">Like</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-red-500 transition">
                      <span className="text-lg">👎</span>
                      <span className="text-xs hidden md:inline">Dislike</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-1 hover:text-green-600 transition">
                    <span className="text-lg">💬</span>
                    <span className="text-xs">{post.comments_count || 0}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right sidebar - Hidden on mobile */}
        <aside className="hidden md:block md:col-span-1 bg-white p-4 rounded-xl shadow-sm h-fit sticky top-6">
          <h2 className="text-lg font-semibold mb-4">Suggestions</h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li><a href="#" className="hover:underline">Trending</a></li>
            <li><a href="#" className="hover:underline">Popular Users</a></li>
            <li>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Create Post
              </button>
            </li>
          </ul>
        </aside>
      </div>

      {/* Modal for Create Post (Mobile optimized) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white w-full max-w-md rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Create Post</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && (
                <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}
              
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded h-32 text-sm"
                placeholder="What's on your mind?"
                required
              />
              
              {preview && (
                <div className="relative">
                  {file.type.startsWith("image/") ? (
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full rounded" 
                    />
                  ) : (
                    <video
                      controls
                      className="w-full rounded"
                    >
                      <source src={preview} type={file.type} />
                    </video>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*, video/*"
                    className="hidden"
                    id="mobile-file-upload"
                  />
                  <span className="bg-gray-200 p-2 rounded-full">
                    📷
                  </span>
                  <span>Photo/Video</span>
                </label>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm disabled:bg-blue-300"
                >
                  {isLoading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen media viewer */}
      {fullscreenMedia && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            className="absolute top-4 left-4 text-white text-2xl z-10"
            onClick={() => setFullscreenMedia(null)}
          >
            ←
          </button>
          
          {fullscreenMedia.media_url.endsWith('.mp4') ? (
            <video 
              controls 
              autoPlay
              className="w-full h-full object-contain"
            >
              <source src={fullscreenMedia.media_url} type="video/mp4" />
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src={fullscreenMedia.media_url}
                alt="Fullscreen"
                width={800}
                height={800}
                className="object-contain max-w-full max-h-full"
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}