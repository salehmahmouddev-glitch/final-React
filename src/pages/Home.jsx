import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));

  const navigate = useNavigate();

  useEffect(() => {
    function syncUser() {
      setUser(JSON.parse(localStorage.getItem("user")));
    }
    window.addEventListener("authChange", syncUser);
    return () => window.removeEventListener("authChange", syncUser);
  }, []);

  useEffect(() => {
    axios
      .get(`${API}/posts`)
      .then((res) => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setLoading(false);
      });
  }, []);

  function handleDelete(postId) {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const token = localStorage.getItem("token");

    axios
      .delete(`${API}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setPosts((prev) => prev.filter((p) => p.id !== postId)))
      .catch(() => alert("Failed to delete post."));
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Latest Posts</h1>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">__</p>
          <p className="text-lg">No posts yet. Be the first to add one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
            >
              <img
                src={post.image || "https://picsum.photos/seed/" + post.id + "/600/400"}
                alt={post.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://picsum.photos/seed/" + post.id + "/600/400";
                }}
              />

              <div className="p-5 flex flex-col flex-grow">
                <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-gray-500 text-sm flex-grow line-clamp-3">
                  {post.description}
                </p>

                <div className="flex items-center gap-2 mt-4">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {post.author ? post.author[0].toUpperCase() : "?"}
                  </div>
                  <span className="text-xs text-gray-400">{post.author}</span>
                </div>

                {user && user.email === post.authorEmail && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => navigate(`/edit-post/${post.id}`)}
                      className="flex-1 bg-amber-400 hover:bg-amber-500 text-white py-1.5 rounded-lg text-sm font-semibold transition"
                    >
                       Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-lg text-sm font-semibold transition"
                    >
                       Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {user && (
        <button
          onClick={() => navigate("/add-post")}
          title="Add New Post"
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-xl text-3xl flex items-center justify-center transition-transform hover:scale-110"
        >
          +
        </button>
      )}
    </div>
  );
}

export default Home;
