"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

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

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const data = await fetchUser();
      setUser(data);
      setLoadingUser(false);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim()) {
        try {
          setLoadingSearch(true);
          const res = await fetch(`/api/search/${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(data);
        } catch (err) {
          setResults([]);
        } finally {
          setLoadingSearch(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleViewProfile = (slug) => {
    router.push(`/profile/${slug}`);
    setQuery("");
    setResults([]);
    setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
  };

  if (loadingUser)
    return <div className="h-16 w-full bg-white shadow fixed top-0 z-50"></div>;

  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow">
      <div className="flex justify-between items-center h-16 px-4 md:px-6 bg-white text-blue-600">
        <Image
          src="/Logo.png"
          alt="Logo"
          width={45}
          height={45}
          className="cursor-pointer rounded-full mr-2"
        />
        <h1 className="text-3xl font-bold">FastKnuck</h1>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center ml-auto bg-white rounded-full px-4 py-1 border border-gray-600 w-80">
          <FontAwesomeIcon icon={faSearch} className="text-gray-600 mr-2" />
          <input
            type="text"
            placeholder="Cari pengguna..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-gray-600 placeholder-gray-400 outline-none w-full"
          />
        </div>
        <div className="flex items-center">
          {/* Mobile Search Toggle */}
          <button
            onClick={toggleSearch}
            className="md:hidden p-2 rounded-full"
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
          {/* User / Login */}
          <div className="ml-4">
            {user ? (
              <Link href="/profile">
                <div className="flex items-center gap-2 cursor-pointer">
                  {user.profile_picture ? (
                    <Image
                      src={user.profile_picture}
                      alt="Profile"
                      width={36}
                      height={36}
                      className="rounded-full border-2 border-white"
                      priority
                    />
                  ) : (
                    <Image
                      src="/profile.jpg"
                      alt="Profile"
                      width={36}
                      height={36}
                      className="rounded-full border-2 border-white"
                      priority
                    />
                  )}
                </div>
              </Link>
            ) : (
              <Link href="/Auth">
                <button className="bg-blue-500 hover:bg-white hover:text-blue-500 border-2 border-blue-500 text-white px-5 py-1 rounded-3xl text-base font-semibold">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Input */}
      {isSearchOpen && (
        <div className="md:hidden px-4 py-2 bg-white border-t">
          <div className="flex items-center border rounded-full px-3 py-1">
            <FontAwesomeIcon icon={faSearch} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full outline-none"
            />
          </div>
        </div>
      )}

      {/* Search Dropdown */}
      {(isSearchOpen || query) && (
        <div className="relative md:absolute md:left-1/2 md:transform md:-translate-x-1/2 w-full bg-white px-4  py-2 shadow-md z-50">
          {loadingSearch && (
            <p className="text-sm mt-1 text-gray-500">Memuat...</p>
          )}

          {results.length > 0 && (
            <ul className="rounded-md">
              {results.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleViewProfile(user.slug || user.name)}
                  className="w-full px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-3"
                >
                  {user.profile_picture ? (
                    <Image
                      src={user.profile_picture}
                      alt={user.name}
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-white text-sm"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!loadingSearch && query && results.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Tidak ada pengguna ditemukan
            </p>
          )}
        </div>
      )}
    </nav>
  );
}
