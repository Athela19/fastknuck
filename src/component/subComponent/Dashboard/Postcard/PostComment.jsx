"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import axios from "axios";

dayjs.extend(relativeTime);

export default function PostComments({ post, profilePic }) {
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState({}); // Store user data by ID

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/post/${post.id}/comment`, {
          withCredentials: true,
        });
        setComments(response.data);

        // Extract unique user IDs from comments
        const userIds = [...new Set(response.data.map(comment => comment.user_id))];
        
        if (userIds.length > 0) {
          // Fetch user data for all commenters
          const usersResponse = await axios.get('/api/users', {
            params: { ids: userIds.join(',') },
            withCredentials: true
          });
          
          // Create a mapping of user ID to user data
          const usersMap = {};
          usersResponse.data.forEach(user => {
            usersMap[user.id] = {
              name: user.name,
              profile_picture: user.profile_picture || '/profile.jpg'
            };
          });
          setUsers(usersMap);
        }
      } catch (err) {
        console.error("Gagal memuat komentar:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [post.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    try {
      const response = await axios.post(
        `/api/post/${post.id}/comment`,
        { content: commentInput },
        { withCredentials: true }
      );

      // Add the new comment to the beginning of the list
      setComments(prev => [response.data, ...prev]);
      setCommentInput("");
    } catch (err) {
      console.error("Gagal mengirim komentar:", err);
    }
  };

  return (
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
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
            aria-label="Komentar"
          />
          <button
            onClick={handleSubmit}
            className="text-blue-500 font-medium text-sm px-3"
            disabled={!commentInput.trim()}
          >
            Kirim
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Memuat komentar...</p>
      ) : (
        comments.map((comment) => {
          const user = users[comment.user_id] || {
            name: "Pengguna",
            profile_picture: "/profile.jpg"
          };

          return (
            <div key={comment.id} className="flex gap-2">
              <img
                src={user.profile_picture}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
                loading="lazy"
              />
              <div className="flex-1 bg-gray-100 rounded-lg p-3">
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-sm mt-1">{comment.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {dayjs(comment.created_at).fromNow()}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}