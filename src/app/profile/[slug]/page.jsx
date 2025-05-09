"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

const ProfilePage = () => {
  const params = useParams();
  const slug = params?.slug;
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
            setUserData(data[0]); // Ambil user pertama dari array
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-[10rem]">
      <h1 className="text-2xl font-bold">Profile of {userData.name}</h1>
      <p className="mt-4 text-lg">Email: {userData.email}</p>
    </div>
  );
};

export default ProfilePage;
