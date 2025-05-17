"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Sidekanan() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRecentConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/message/recent", {
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        setConversations(data.conversations || []);
        setError(null);
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Gagal memuat percakapan");
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentConversations();
    
    const interval = setInterval(fetchRecentConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Handle both string and Date objects
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return '';
    }
  };

  const handleConversationClick = (username) => {
    if (username) {
      router.push(`/chat/${encodeURIComponent(username)}`);
    }
  };

  return (
    <div className="w-2/7 h-screen bg-gray-200 p-4 fixed top-16 right-0 overflow-y-auto lg:block hidden">
      <h2 className="text-xl font-semibold mb-4">Obrolan Terakhir</h2>
      
      {error ? (
        <div className="text-red-500 p-2 bg-red-50 rounded">
          {error} - <button 
            onClick={() => window.location.reload()} 
            className="text-blue-500 hover:underline"
          >
            Coba lagi
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-3 rounded shadow animate-pulse h-20" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <p className="text-gray-500">Tidak ada obrolan terakhir</p>
      ) : (
        <ul className="space-y-3">
          {conversations.map((conv) => (
            <li 
              key={conv.id || conv.other_user_id} 
              className="bg-white p-3 rounded shadow hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleConversationClick(conv.other_user_name)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Image
                    src={conv.other_user_profile_picture || "/profile.jpg"}
                    alt={conv.other_user_name || "Profile"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover aspect-square"
                    onError={(e) => {
                      e.target.src = "/profile.jpg";
                    }}
                  />
                  {conv.is_online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium truncate">
                      {conv.other_user_name || "Unknown User"}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTime(conv.last_message_time)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.last_message_sender === conv.current_user_id ? "Anda: " : ""}
                    {conv.last_message_content || ""}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}