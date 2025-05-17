"use client";

import React from "react";
import { FiHome, FiUser, FiBell, FiSettings } from "react-icons/fi";

export default function Sidekiri() {
  return (
    <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-200 text-black flex flex-col justify-between lg:block hidden">
      <nav className="flex-grow">
        <ul className="space-y-4 mt-4 px-4">
          <li>
            <a
              href="#home"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-[20px] hover:bg-gray-400 space-x-3"
            >
              <span className="text-xl text-blue-600">
                <FiHome />
              </span>
              <span className="text-lg">Beranda</span>
            </a>
          </li>

          <li>
            <a
              href="#friends"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-[20px] hover:bg-gray-400 space-x-3"
            >
              <span className="text-xl text-blue-600">
                <FiUser />
              </span>
              <span className="text-lg">Teman</span>
            </a>
          </li>

          <li>
            <a
              href="#notifications"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-[20px] hover:bg-gray-400 space-x-3"
            >
              <span className="text-xl text-blue-600">
                <FiBell />
              </span>
              <span className="text-lg">Notifikasi</span>
            </a>
          </li>

          <li>
            <a
              href="#settings"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-[20px] hover:bg-gray-400 space-x-3"
            >
              <span className="text-xl text-blue-600">
                <FiSettings />
              </span>
              <span className="text-lg">Pengaturan</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
