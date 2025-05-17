"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

const ProfilePage = () => {
  const params = useParams();
  const slug = params?.slug;
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      axios.get(`/api/profile/${slug}`)
        .then((response) => {
          const data = response.data;
          if (Array.isArray(data) && data.length > 0) {
            setUserData(data[0]);
            setError(null);
          } else {
            setUserData(null);
            setError('User not found');
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          setError('Failed to load user data');
        })
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleChatClick = () => {
    router.push(`/chat/${slug}`);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Banner */}
      <div className="h-48 w-full bg-gray-200">
        {userData.profile_banner && (
          <img
            src={userData.profile_banner}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Picture */}
      <div className="flex flex-col items-center -mt-20">
        <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-lg">
          {userData.profile_picture ? (
            <img
              src={userData.profile_picture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="bg-gray-300 w-full h-full flex items-center justify-center text-xl">
              ?
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold mt-4">{userData.name}</h1>
        <p className="text-gray-600">{userData.email}</p>
      </div>

      {/* Info Table */}
      <div className="px-8 py-6">
        <table className="w-full table-auto text-left">
          <tbody>
            <tr>
              <th className="py-2 text-gray-500">User ID</th>
              <td className="py-2">{userData.id}</td>
            </tr>
            <tr>
              <th className="py-2 text-gray-500">Email</th>
              <td className="py-2">{userData.email}</td>
            </tr>
            <tr>
              <th className="py-2 text-gray-500">Name</th>
              <td className="py-2">{userData.name}</td>
            </tr>
            <tr>
              <th className="py-2 text-gray-500">Created At</th>
              <td className="py-2">{new Date(userData.created_at).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        {/* Chat Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleChatClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow"
          >
            Chat with {userData.name}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
