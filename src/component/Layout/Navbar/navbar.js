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

  if (loadingUser) return <div className="h-16 w-full bg-white shadow fixed top-0 z-50"></div>;

  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow">
      <div className="flex justify-between items-center h-16 px-4 md:px-6 bg-gray-800 text-white">
        <h1 className="text-2xl font-semibold">FastKnuck</h1>

        {/* Mobile Search Toggle */}
        <button onClick={toggleSearch} className="md:hidden p-2 bg-gray-700 rounded-full">
          <FontAwesomeIcon icon={faSearch} />
        </button>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center ml-auto bg-gray-700 rounded-full px-4 py-1 border border-gray-600 w-80">
          <FontAwesomeIcon icon={faSearch} className="text-gray-300 mr-2" />
          <input
            type="text"
            placeholder="Cari pengguna..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-white placeholder-gray-400 outline-none w-full"
          />
        </div>

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
                  <div className="w-9 h-9 rounded-full bg-gray-500 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-white text-lg" />
                  </div>
                )}
              </div>
            </Link>
          ) : (
            <Link href="/Auth">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                Login
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Search Dropdown */}
      {(isSearchOpen || query) && (
        <div className="relative bg-white px-4 md:px-6 py-2 shadow-md">
          {loadingSearch && <p className="text-sm mt-1 text-gray-500">Memuat...</p>}

          {results.length > 0 && (
            <ul className="mt-2 border rounded-md shadow divide-y">
              {results.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleViewProfile(user.slug || user.name)}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-3"
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
                      <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!loadingSearch && query && results.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">Tidak ada pengguna ditemukan</p>
          )}
        </div>
      )}
    </nav>
  );
}
