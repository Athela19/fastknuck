"use client";

import { useState, useEffect } from "react";
import PostCreate from "./PostCreate";
import PostList from "./PostList";
import { fetchProfileData, fetchPosts } from "./hooks";

export default function PostCard() {
  const [state, setState] = useState({
    posts: [],
    isModalOpen: false,
    profilePic: "/profile.jpg",
    name: "",
    users: {},
  });

  const { posts, isModalOpen, profilePic, name, users } = state;

  useEffect(() => {
    const loadData = async () => {
      const profile = await fetchProfileData();
      const { posts: fetchedPosts, users: fetchedUsers } = await fetchPosts();
      
      setState(prev => ({
        ...prev,
        ...profile,
        posts: fetchedPosts,
        users: fetchedUsers
      }));
    };

    loadData();
  }, []);

  return (<div>
    <p>tes</p>
    <div className="max-w-2xl mx-auto p-4 space-y-6 bg-gray-200 mt-12">
      <PostCreate
        profilePic={profilePic}
        name={name}
        isModalOpen={isModalOpen}
        onModalToggle={(value) => setState(prev => ({ ...prev, isModalOpen: value }))}
        onPostCreated={async () => {
          const { posts: newPosts } = await fetchPosts();
          setState(prev => ({ ...prev, posts: newPosts, isModalOpen: false }));
        }}
      />

      <PostList 
        posts={posts} 
        users={users} 
        profilePic={profilePic}
      />
    </div>
    </div>
  );
}