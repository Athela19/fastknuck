"use client";

import React from "react";

export default function Sidekanan() {
  return (
    <div className="w-2/7 h-screen bg-gray-200 p-4 fixed top-16 right-0 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Obrolan</h2>
      <ul className="space-y-6">
        <li className="bg-white p-3 rounded shadow">Pesan dari pengguna A</li>
        <li className="bg-white p-3 rounded shadow">Pesan dari pengguna B</li>
        <li className="bg-white p-3 rounded shadow">Pesan dari pengguna C</li>
        {/* Tambahkan elemen lainnya di sini */}
      </ul>
    </div>
  );
}
