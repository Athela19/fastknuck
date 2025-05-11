"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

const fetchUser = async () => {
  try {
    const res = await fetch("/api/auth", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Fetch user error:", error);
    return null;
  }
};

export default function Sidekiri() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const data = await fetchUser();
      setUser(data);
      setLoadingUser(false);
    };
    loadUser();
  }, []);

  if (loadingUser) {
    return (
      <div className="w-2/7 h-screen bg-gray-200 p-4 fixed top-16 left-0">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-2/7 h-screen bg-gray-200 p-4 fixed top-16 left-0">
      <div className="flex items-center mb-4">
        <Image
          src={
            imageError || !user?.profile_picture
              ? "/profile.jpg"
              : user.profile_picture
          }
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full mr-2 border-2 border-gray-400 object-cover"
          onError={() => setImageError(true)}
        />
        <span
          className="font-bold truncate max-w-[250px]"
          title={user?.name}
          style={{
            fontSize: `${Math.max(16, 28 - (user?.name?.length || 0))}px`,
          }}
        >
          {user?.name || "Unknown"}
        </span>
      </div>

      <ul className="space-y-6">
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
    </div>
  );
}
