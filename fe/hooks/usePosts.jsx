import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

const API_URL = "http://localhost:5000/api/posts";
const SOCKET_URL = "http://localhost:5000";

export function usePosts(token) {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState(null);

  // ---------------- SOCKET ----------------
// ---------------- SOCKET ----------------
useEffect(() => {
  if (!token) return;

  const socket = io(SOCKET_URL);

  socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
  socket.on("disconnect", () => console.log("❌ Socket disconnected"));

  socket.on("post_created", (post) => {
    console.log("🆕 Post created:", post);
    setPosts((prev) => [post, ...prev]);
  });

  // ✅ Thêm listener cho post_updated
  socket.on("post_updated", (updatedPost) => {
    console.log("✏️ Post updated:", updatedPost);
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  });

  // ✅ Thêm listener cho post_deleted
  socket.on("post_deleted", ({ id }) => {
    console.log("🗑️ Post deleted, ID:", id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  });

  socket.on("comment_created", (comment) => {
    console.log("💬 Comment created:", comment);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === comment.postId
          ? { ...p, comments: [...(p.comments || []), comment] }
          : p
      )
    );
  });

  // ✅ Thêm listener cho comment_deleted
  socket.on("comment_deleted", ({ postId, commentId }) => {
    console.log("🗑️ Comment deleted:", commentId);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: p.comments?.filter((c) => c.id !== commentId) }
          : p
      )
    );
  });

  return () => socket.disconnect();
}, [token]);

  // ---------------- FETCH POSTS ----------------
const fetchPosts = useCallback(async () => {
  console.log("🔍 fetchPosts called, token:", token ? "exists" : "missing"); // ✅ Log 1
  
  if (!token) return;
  setLoadingPosts(true);
  try {
    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log("📡 Response status:", res.status); // ✅ Log 2
    
    const data = await res.json();
    
    console.log("📦 Response data:", data); // ✅ Log 3

    if (data.success) {
      console.log("✅ Setting posts:", data.posts.length, "posts"); // ✅ Log 4
      setPosts(data.posts);
    } else {
      console.error("❌ API returned success: false", data.message); // ✅ Log 5
      setError(data.message || "Failed to fetch posts");
    }
  } catch (err) {
    console.error("💥 Fetch error:", err); // ✅ Log 6
    setError(err.message);
  } finally {
    setLoadingPosts(false);
  }
}, [token]);

  // ---------------- CREATE POST ----------------
const createPost = useCallback(
  async (title, content) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();

    if (data.success) {
      setPosts((prev) => [data.post, ...prev]);
      return data.post;
    } else throw new Error(data.message || "Failed to create post");
  },
  [token]
);

  // ---------------- UPDATE POST ----------------
  const updatePost = useCallback(
    async (id, title, content) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();

      if (data.success) {
        setPosts((prev) => prev.map((p) => (p.id === id ? data.post : p)));
        return data.post;
      } else throw new Error(data.message || "Failed to update post");
    },
    [token]
  );

  // ---------------- DELETE POST ----------------
  const deletePost = useCallback(
    async (id) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        return true;
      } else throw new Error(data.message || "Failed to delete post");
    },
    [token]
  );

  // ---------------- COMMENTS ----------------
  const fetchComments = useCallback(
    async (postId) => {
      const res = await fetch(`${API_URL}/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) return data.comments;
      else throw new Error(data.message || "Failed to fetch comments");
    },
    [token]
  );

const createComment = useCallback(
  async (postId, content) => {
    const res = await fetch(`${API_URL}/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    const data = await res.json();

    if (data.success) {
      // ✅ Xóa setPosts để tránh duplicate
      return data.comment;
    } else {
      throw new Error(data.message || "Failed to create comment");
    }
  },
  [token]
);


  const deleteComment = useCallback(
    async (postId, commentId) => {
      const res = await fetch(`${API_URL}/${postId}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: p.comments?.filter((c) => c.id !== commentId),
                }
              : p
          )
        );
        return true;
      } else throw new Error(data.message || "Failed to delete comment");
    },
    [token]
  );

  // ---------------- RETURN ----------------
  return {
    posts,
    loadingPosts,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    fetchComments,
    createComment,
    deleteComment,
  };
}
