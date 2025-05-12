"use client";

import PostItem from "./PostItem";

export default function PostList({ posts, users, profilePic }) {
  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <PostItem 
          key={post.id} 
          post={post} 
          user={users[post.user_id] || {}} 
          profilePic={profilePic}
        />
      ))}
    </div>
  );
}