import axios from "axios";

export const fetchProfileData = async () => {
  try {
    const response = await axios.get("/api/auth", { withCredentials: true });
    return {
      profilePic: response.data.profile_picture || "/profile.jpg",
      name: response.data.name || "Teman",
    };
  } catch (err) {
    console.error("Gagal memuat data profil:", err);
    return { profilePic: "/profile.jpg", name: "Teman" };
  }
};

export const fetchLikesStatus = async (posts) => {
  try {
    const response = await axios.get("/api/post/likes", {
      withCredentials: true,
    });

    const likesMap = {};
    const commentsMap = {};

    response.data.forEach((item) => {
      likesMap[item.post_id] = parseInt(item.like_count) || 0;
      commentsMap[item.post_id] = parseInt(item.comment_count) || 0;
    });

    return posts.map((post) => ({
      ...post,
      likes_count: likesMap[post.id] || 0,
      comments_count: commentsMap[post.id] || 0,
    }));
  } catch (err) {
    console.error("Gagal memuat status like:", err);
    return posts;
  }
};

export const fetchPosts = async () => {
  try {
    const response = await axios.get("/api/post", { withCredentials: true });
    const postsWithLikesAndComments = await fetchLikesStatus(response.data);

    const userIds = [...new Set(response.data.map((post) => post.user_id))];
    let usersMap = {};

    if (userIds.length > 0) {
      const usersResponse = await axios.get("/api/users", {
        params: { ids: userIds.join(",") },
        withCredentials: true,
      });

      usersMap = usersResponse.data.reduce((acc, user) => {
        acc[user.id] = {
          ...user,
          profile_url: user.profile_picture || "/profile.jpg",
          name: user.name || "Pengguna",
        };
        return acc;
      }, {});
    }

    return {
      posts: postsWithLikesAndComments,
      users: usersMap,
    };
  } catch (err) {
    console.error("Gagal memuat postingan:", err);
    return { posts: [], users: {} };
  }
};