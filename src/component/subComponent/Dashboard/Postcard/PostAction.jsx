"use client";

import { useState, useEffect } from "react";
import { FaHeart, FaCommentDots, FaSpinner } from "react-icons/fa";
import axios from "axios";

export default function PostActions({ post, onToggleComments }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/post/${post.id}/like/status`, {
          withCredentials: true,
        });
        setLiked(response.data.liked);
      } catch (err) {
        console.error("Failed to check like status:", err);
        setError("Failed to load like status");
      } finally {
        setLoading(false);
      }
    };

    checkLikeStatus();
  }, [post.id]);

  const handleLike = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const newLiked = !liked;
      setLiked(newLiked);
      setLikeCount(newLiked ? likeCount + 1 : likeCount - 1);

      await axios[newLiked ? "post" : "delete"](
        `/api/post/${post.id}/like`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to toggle like:", err);
      setError("Failed to update like");
      // Rollback on error
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-gray-600">
      <div className="flex items-center gap-4">
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center gap-1.5 transition-colors ${
            liked ? "text-red-500" : "hover:text-red-500"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label={liked ? "Unlike post" : "Like post"}
        >
          {loading ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaHeart className={liked ? "fill-current" : ""} />
          )}
          <span className="text-sm">
            {likeCount} {likeCount === 1 ? "Like" : "Likes"}
          </span>
        </button>
        
        <button
          onClick={onToggleComments}
          className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
          aria-label="Toggle comments"
        >
          <FaCommentDots />
          <span className="text-sm">
            {post.comments_count || 0} {post.comments_count === 1 ? "Comment" : "Comments"}
          </span>
        </button>
      </div>
      
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}