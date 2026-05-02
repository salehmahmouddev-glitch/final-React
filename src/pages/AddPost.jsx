import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000";

function AddPost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imgError, setImgError] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user || !token) navigate("/login");
  }, []);

  // If editing, pre-fill the form
  useEffect(() => {
    if (isEditing) {
      axios
        .get(`${API}/posts/${id}`)
        .then((res) => {
          setTitle(res.data.title);
          setDescription(res.data.description);
          setImage(res.data.image || "");
        })
        .catch(() => setError("Could not load post data."));
    }
  }, [id, isEditing]);

  // Reset image error whenever the URL changes
  useEffect(() => {
    setImgError(false);
  }, [image]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const postData = {
      title,
      description,
      image,
      author: user.name,
      authorEmail: user.email,
    };

    const request = isEditing
      ? axios.put(`${API}/posts/${id}`, postData, {
          headers: { Authorization: `Bearer ${token}` },
        })
      : axios.post(`${API}/posts`, postData, {
          headers: { Authorization: `Bearer ${token}` },
        });

    request
      .then(() => navigate("/"))
      .catch(() => {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">{isEditing ? "✏️" : "➕"}</p>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? "Edit Post" : "Add New Post"}
          </h2>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Give your post a title"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              placeholder="Write your post content here..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Image URL — type="text" to accept any link without browser validation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Live preview — shows as soon as you paste a link */}
            {image && !imgError && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-1">Preview:</p>
                <img
                  src={image}
                  alt="Preview"
                  onError={() => setImgError(true)}
                  className="w-full h-44 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Show friendly message if the image link is broken */}
            {image && imgError && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                ⚠️ Can't load this image. Check the link and try again.
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-semibold text-sm transition"
            >
              {loading ? "Saving..." : isEditing ? "Update Post" : "Publish Post"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddPost;
