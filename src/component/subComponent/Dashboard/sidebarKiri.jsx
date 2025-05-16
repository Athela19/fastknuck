"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  FiHome,
  FiSearch,
  FiUser,
  FiBell,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const data = await fetchUser();
      setUser(data);
      setLoadingUser(false);
    };
    loadUser();
  }, []);

  const menuItems = [
    { icon: <FiHome />, label: "Beranda" },
    { icon: <FiSearch />, label: "Pencarian" },
    { icon: <FiUser />, label: "Teman" },
    { icon: <FiBell />, label: "Notifikasi" },
    { icon: <FiSettings />, label: "Pengaturan" },
  ];

  if (loadingUser) {
    return (
      <div
        className={`h-screen bg-gray-900 text-white p-4 fixed top-16 left-0 lg:block hidden ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`pt-6 h-screen bg-gray-200 w-100 text-black transition-all duration-300 ease-in-out fixed top-16 left-0 lg:block hidden  ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >


      {/* Menu Items */}
      <nav>
        <ul className="space-y-4">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-r-[20px] hover:bg-gray-400 focus:bg-blue-300 transition-colors duration-200 ${
                  isCollapsed ? "justify-center" : "space-x-3"
                }`}
              >
                <span className="text-xl text-neon-blue">{item.icon}</span>
                {!isCollapsed && (
                  <span className="text-neon-pink text-2xl font-base ">{item.label}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={`flex items-center mb-6 px-4 ${isCollapsed ? "justify-center" : ""}`}>
        <Image
          src={
            imageError || !user?.profile_picture
              ? "/profile.jpg"
              : user.profile_picture
          }
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full border-2 border-gray-400 object-cover"
          onError={() => setImageError(true)}
        />
        {!isCollapsed && (
          <span
            className="font-bold ml-2 truncate"
            title={user?.name}
            style={{
              fontSize: `${Math.max(16, 28 - (user?.name?.length || 0))}px`,
            }}
          >
            {user?.name || "Unknown"}
          </span>
        )}
      </div>

    </div>
  );
}
