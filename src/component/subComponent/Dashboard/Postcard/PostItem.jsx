"use client";

import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ReactPlayer from "react-player";
import { FaUserPlus, FaEllipsisH } from "react-icons/fa";
import PostActions from "./PostAction";
import PostComments from "./PostComment";
import { isVideo } from "./utils";

dayjs.extend(relativeTime);

export default function PostItem({ post, user, profilePic }) {
  const [showComments, setShowComments] = useState(false);

  return (
    <article className="bg-white rounded-lg shadow-sm p-4 space-y-4">
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

      <div className="space-y-4">
        {post.description && (
          <p className="text-gray-800 whitespace-pre-line">
            {post.description}
          </p>
        )}

        {post.media_url && (
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
        )}
      </div>

      <PostActions 
        post={post} 
        onToggleComments={() => setShowComments(!showComments)} 
      />

      {showComments && (
        <PostComments 
          post={post} 
          profilePic={profilePic} 
        />
      )}
    </article>
  );
}