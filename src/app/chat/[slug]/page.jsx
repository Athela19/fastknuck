"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { PaperPlaneIcon, ReloadIcon, ArrowLeftIcon } from "@radix-ui/react-icons";
import Image from "next/image";

export default function ChatPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(false);

  const [userId, setUserId] = useState(null);
  const [userAvatar, setUserAvatar] = useState("/profile.jpg");
  const [recipientData, setRecipientData] = useState({
    id: null,
    name: slug,
    profile_picture: "/profile.jpg"
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch all chat data in one go
  const fetchChatData = async () => {
    try {
      setFetching(true);
      const res = await fetch(`/api/message/${slug}`, {
        method: "GET",
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to fetch chat data");
      
      const data = await res.json();
      
      setMessages(data.messages || []);
      if (data.recipient) {
        setRecipientData({
          id: data.recipient.id,
          name: data.recipient.name,
          profile_picture: data.recipient.profile_picture || "/profile.jpg"
        });
        setOnlineStatus(data.recipient.is_online || false);
      }
      
    } catch (error) {
      console.error("Chat data fetch error:", error);
    } finally {
      setFetching(false);
    }
  };

  // Fetch current user data
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUserId(data.id);
        if (data.profile_picture) setUserAvatar(data.profile_picture);
      } catch (error) {
        console.error(error);
      }
    }
    fetchUser();
  }, []);

  // Initial data load
  useEffect(() => {
    if (userId) fetchChatData();
  }, [slug, userId]);

  // Auto-refresh messages and online status
  useEffect(() => {
    const interval = setInterval(() => {
      if (userId) fetchChatData();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [slug, userId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/message/${slug}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      
      if (!res.ok) throw new Error("Failed to send message");
      
      setNewMessage("");
      await fetchChatData();
      inputRef.current?.focus();
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Check if message is from previous day
  const isNewDay = (currentMsg, previousMsg) => {
    if (!previousMsg) return true;
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const previousDate = new Date(previousMsg.created_at).toDateString();
    return currentDate !== previousDate;
  };

  // Format date header
  const formatDateHeader = (dateString) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const msgDate = new Date(dateString);

    if (msgDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return msgDate.toLocaleDateString([], { 
        weekday: "long", 
        month: "long", 
        day: "numeric" 
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="relative">
            <Image
              src={recipientData.profile_picture}
              alt={`${recipientData.name}'s profile`}
              width={40}
              height={40}
              className="rounded-full object-cover"
              priority
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                onlineStatus ? "bg-green-500" : "bg-gray-400"
              }`}
              aria-label={onlineStatus ? "Online" : "Offline"}
            />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{recipientData.name}</h2>
            <p className="text-xs text-gray-500">
              {onlineStatus ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <button
          onClick={fetchChatData}
          disabled={fetching}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Refresh messages"
        >
          {fetching ? (
            <ReloadIcon className="h-4 w-4 animate-spin" />
          ) : (
            <ReloadIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && !fetching && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isSender = msg.sender_id === userId;
          const showDateHeader = isNewDay(msg, messages[index - 1]);
         

          return (
            <div key={msg.id} className="space-y-1">
              {showDateHeader && (
                <div className="flex justify-center my-4">
                  <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                    {formatDateHeader(msg.created_at)}
                  </span>
                </div>
              )}

              <div className={`flex gap-2 ${isSender ? "justify-end" : "justify-start"}`}>
        
                {isSender && <div className="w-8" />}

                <div
                  className={`max-w-[75%] p-3 rounded-lg ${
                    isSender
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none shadow"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <div
                    className={`text-xs mt-1 flex ${
                      isSender ? "text-blue-100 justify-end" : "text-gray-500 justify-end"
                    }`}
                  >
                    {formatTime(msg.created_at)}
                    {isSender && msg.is_read && (
                      <span className="ml-1 text-blue-200">✓✓</span>
                    )}
                  </div>
                </div>

              
                {!isSender && <div className="w-8" />}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={loading}
            autoFocus
          />
          <button
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center justify-center w-10 h-10"
            onClick={sendMessage}
            disabled={loading || !newMessage.trim()}
            aria-label="Send message"
          >
            {loading ? (
              <ReloadIcon className="h-4 w-4 animate-spin" />
            ) : (
              <PaperPlaneIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}