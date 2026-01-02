import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ForumPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
  });
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/forum");
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      alert("Failed to load forum posts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await api.post("/forum", newPost);
      alert("Post created successfully!");
      setNewPost({ title: "", content: "" });
      setShowAddModal(false);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      alert(error.response?.data?.message || "Failed to create post");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await api.delete(`/forum/${postId}`);
      alert("Post deleted successfully");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(error.response?.data?.message || "Failed to delete post");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Community Forum</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Post
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold mb-2">No Posts Yet</h2>
            <p className="text-base-content/70 mb-4">
              Be the first to share your rental needs or offers!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{post.author?.name}</h3>
                        <span className="badge badge-sm">
                          {post.author?.role}
                        </span>
                        <span className="text-xs text-base-content/50">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                      <p className="text-base-content/80 whitespace-pre-wrap">
                        {post.content}
                      </p>
                      
                      {/* Optional Details */}
                      {(post.city || post.area || post.budgetMin || post.budgetMax || post.propertyType) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.city && (
                            <span className="badge badge-outline">📍 {post.city}</span>
                          )}
                          {post.area && (
                            <span className="badge badge-outline">{post.area}</span>
                          )}
                          {post.budgetMin && (
                            <span className="badge badge-outline">
                              💰 ${post.budgetMin} - ${post.budgetMax || "N/A"}
                            </span>
                          )}
                          {post.propertyType && (
                            <span className="badge badge-outline capitalize">
                              🏠 {post.propertyType}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Delete Button (for post author or admin) */}
                    {currentUser && (currentUser._id === post.author?._id || currentUser.role === "admin") && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="btn btn-ghost btn-sm text-error"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Post Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create a New Post</h3>
            <form onSubmit={handleCreatePost}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Looking for a flat in Gulshan"
                  className="input input-bordered"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  placeholder="Describe your rental needs or offer..."
                  className="textarea textarea-bordered h-32"
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  required
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewPost({ title: "", content: "" });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Post
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => {
              setShowAddModal(false);
              setNewPost({ title: "", content: "" });
            }}
          ></div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ForumPage;
