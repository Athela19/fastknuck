"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth", {
        method: "GET",
        credentials: "include", // kirim cookie ke server
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!res.ok) {
        console.log("Failed to fetch user data:", res.statusText);
        return null;
      }
  
      const data = await res.json();
      console.log("User from API:", data); // debug: lihat user
      console.log("User name:", data?.name); // ✅ pakai 'data', bukan 'user'
      return data;
    } catch (error) {
      console.log("Error fetching user data:", error);
      return null;
    }
  };
  

function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const userData = await fetchUser();
      setUser(userData);
    };

    getUser();
  }, []);

  return (
    <div className="fixed top-0 w-full z-50 bg-white shadow">
    <div className="bg-gray-800 py-4 text-white text-center flex justify-between px-10">
      <h1 className="text-2xl font-semibold">FastKnuck</h1>

      {user ? (
        <span className="text-white">Hi, {user.name}</span>
      ) : (
        <Link href="/Auth">
          <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
            Login
          </button>
        </Link>
      )}
    </div>
    </div>
  );
}

export default Navbar;
