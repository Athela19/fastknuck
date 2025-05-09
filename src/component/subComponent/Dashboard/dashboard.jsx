'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState({});
  const [fullscreenMedia, setFullscreenMedia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for post creation
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

    // Validasi tipe file
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp',
      'video/mp4', 'video/mkv'  // Tambahkan format mkv
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Hanya file JPEG, PNG, WEBP, MP4, dan MKV yang diizinkan');
      return;
    }

    // Validasi ukuran file (maksimal 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Ukuran file maksimal 10MB');
      return;
    }

    setError("");
    setFile(selectedFile);

    // Buat preview
    const fileUrl = URL.createObjectURL(selectedFile);
    setPreview(fileUrl);
    setFullPreview(fileUrl); // Set full preview untuk video
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
        credentials: 'include', // Penting untuk mengirim cookies
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal membuat post');
      }

      // Jika sukses
      const data = await res.json();
      alert("Post berhasil dibuat!");
      setFile(null);
      setPreview(null);
      setDescription("");
      setIsModalOpen(false); // Close the modal after successful submission
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);

      // Jika error unauthorized, arahkan ke login
      if (err.message.includes('Unauthorized') || err.message.includes('token')) {
        window.location.href = '/Auth';
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6 z-100">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">New Posts</h1>

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar Kiri */}
        <aside className="col-span-1 bg-white p-4 rounded-xl shadow-sm h-fit sticky top-6">
          <h2 className="text-lg font-semibold mb-4">Sidebar Kiri</h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li><a href="#" className="hover:underline">Menu 1</a></li>
            <li><a href="#" className="hover:underline">Menu 2</a></li>
            <li><a href="#" className="hover:underline">Menu 3</a></li>
          </ul>
        </aside>

        {/* Konten Tengah */}
        <div className="col-span-2 flex flex-col gap-6">
          {posts.map((post) => {
            const isVideo = post.media_url?.endsWith('.mp4') || post.media_url?.endsWith('.webm');
            const author = authors[post.user_id];

            return (
              <div
                key={post.id}
                className="w-full bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-4">
                  <p className="text-sm text-gray-800 mb-2">{post.description}</p>
                  {author && (
                    <button
                      onClick={() => alert(`Nama: ${author.name}\nEmail: ${author.email}`)}
                      className="text-blue-600 text-xs hover:underline"
                    >
                      By: {author.name}
                    </button>
                  )}
                </div>

                {/* Hanya tampilkan preview jika ada media */}
                {post.media_url && (
                  <div className="w-full aspect-square bg-black">
                    {isVideo ? (
                      <video
                        controls
                        className="w-full h-full object-cover"
                        onClick={() => setFullscreenMedia(post)}
                      >
                        <source src={post.media_url} type="video/mp4" />
                      </video>
                    ) : (
                      <Image
                        src={post.media_url}
                        alt="media"
                        width={500}  // You can adjust the width
                        height={500} // You can adjust the height
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setFullscreenMedia(post)}
                      />
                    )}
                  </div>
                )}

                {/* Tombol Like, Dislike, Chat */}
                <div className="flex justify-between items-center px-4 py-2 border-t text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 hover:text-blue-600 transition">
                      <span>👍</span>
                      <span>Like</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-red-500 transition">
                      <span>👎</span>
                      <span>Dislike</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-1 hover:text-green-600 transition">
                    <span>💬</span>
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Kanan */}
        <aside className="col-span-1 bg-white p-4 rounded-xl shadow-sm h-fit sticky top-6">
          <h2 className="text-lg font-semibold mb-4">Sidebar Kanan</h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li><a href="#" className="hover:underline">Notifikasi</a></li>
            <li><a href="#" className="hover:underline">Info Lain</a></li>
            <li><a href="#" className="hover:underline">Kontak</a></li>
            {/* Tombol untuk membuka modal */}
            <li>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Buat Post Baru
              </button>
            </li>
          </ul>
        </aside>
      </div>

      {/* Modal untuk Create Post */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div
            className="bg-white w-full max-w-lg p-6 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Buat Post Baru</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Deskripsi */}
              <div>
                <label className="block mb-2 font-medium">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded h-24"
                  required
                />
              </div>

              {/* Preview */}
              {preview && (
                <div className="border p-2 rounded">
                  <h3 className="font-medium mb-2">Pratinjau:</h3>
                  {file.type.startsWith("image/") ? (
                    <img 
                      src={preview} 
                      alt="Pratinjau" 
                      className="max-w-full max-h-60 cursor-pointer" 
                      onClick={() => setFullPreview(preview)} 
                    />
                  ) : file.type.startsWith("video/") ? (
                    <video
                      controls
                      className="max-w-full cursor-pointer"
                      onClick={() => setFullPreview(preview)} 
                    >
                      <source src={preview} type={file.type} />
                      Browser tidak mendukung video
                    </video>
                  ) : null}
                </div>
              )}

              {/* Pilih File dan Tombol Buat Post */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <img 
                      src="/path/to/your/image-icon.png" 
                      alt="Choose File"
                      className="w-10 h-10" 
                    />
                    <input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/jpeg, image/png, image/webp, video/mp4, video/mkv"
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${isLoading ? 'bg-gray-400' : ''}`}
                  >
                    {isLoading ? 'Menyimpan...' : 'Buat Post'}
                  </button>
                </div>
              </div>
            </form>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Preview */}
      {fullscreenMedia && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setFullscreenMedia(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl font-bold"
            onClick={() => setFullscreenMedia(null)}
          >
            ×
          </button>

          <div
            className="bg-black max-w-[600px] max-h-[90vh] w-full rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {fullscreenMedia.media_url.endsWith('.mp4') ? (
              <video controls className="w-full h-full object-contain">
                <source src={fullscreenMedia.media_url} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={fullscreenMedia.media_url}
                alt="fullscreen"
                width={800}
                height={800}
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
