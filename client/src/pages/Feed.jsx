import "../styles/Feed.css"
import usePostSocket from "../hooks/usePostSocket";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import socket from "../socket";
import { useMessages } from "../context/MessageContext";
import ToastNotification from "../components/ToastNotification";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import Card from "../components/Card";
import PostCard from "../components/PostCard"
import ChatWidget from "../components/chat/ChatWidget";
import api from "../api/api";
import { getImageUrl } from "../utils/getImageUrl";

export default function Feed({user,  darkMode, setDarkMode, logout }) {

  /* ========================== STATES ========================== */

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  
  const [posts, setPosts] = useState([]);
  
  usePostSocket(setPosts);

  const { toast, setToast } = useNotifications();

  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);

  const [commentText, setCommentText] = useState({});

  const { count: notificationCount } = useNotifications();
  const { count: messageCount } = useMessages();

  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

  const removeImage = () => {
    setImage(null);
  };
const navigate = useNavigate();  

useEffect(() => {

  const handleNewNotification = (event) => {
    const data = event.detail;

    setToast({
      fromUser: data.fromUser,
      type: "message",
      text: data.text
    });

  };

  window.addEventListener("newNotification", handleNewNotification);

  return () => {
    window.removeEventListener("newNotification", handleNewNotification);
  };

}, []);


  /* ========================== 🔍 BUSCAR USUARIOS ========================== */

  useEffect(() => {

    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(async () => {

try {

  const data = await api.get(
    `/users/search?username=${searchText}`
  );

  if (Array.isArray(data)) {
    setSearchResults(data);
  }

} catch (error) {
  console.error("Error buscando usuarios:", error);
}

    }, 300);

    return () => clearTimeout(delay);

  }, [searchText, token]);

  /* ========================== 📥 OBTENER POSTS ========================== */

const fetchPosts = async () => {

  try {

    const data = await api.get("/posts/feed");

    if (!Array.isArray(data)) return;

    const ordered = data.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    setPosts(ordered);

  } catch (error) {
    console.error("Error obteniendo posts:", error);
  }

};

  useEffect(() => {
    if (token) fetchPosts();
  }, [token]);

  /* ========================== 📝 CREAR POST ========================== */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!content.trim() && !image) return;

    try {

      const formData = new FormData();

      formData.append("content", content);

      if (image) {
        formData.append("image", image);
      }

await api.post(
  "/posts",
  formData
);

      setContent("");
      setImage(null);

    } catch (error) {
      console.error("Error creando post:", error);
    }

  };

  /* ========================== 🗑️ ELIMINAR POST ========================== */

  const handleDelete = async (id) => {

    try {

    await api.delete(`/posts/${id}`);

      setPosts((prev) =>
        prev.filter((p) => p._id !== id)
      );

    } catch (error) {
      console.error("Error eliminando post:", error);
    }

  };

  /* ========================== ❤️ LIKE POST ========================== */

  const handleLike = async (id) => {

    try {

await api.put(
  `/posts/like/${id}`
);

    } catch (error) {
      console.error("Error dando like:", error);
    }

  };
  /*REPOST */
const handleRepost = async (id) => {

  try {

    await api.post(
      `/posts/${id}/repost`
    );

  } catch (error) {

    console.error(
      "Error haciendo repost:",
      error
    );

  }

};



  /* ========================== 💬 CREAR COMENTARIO ========================== */

  const handleComment = async (postId, commentKey) => {

    const text = commentText[postId];

    if (!text?.trim()) return;

    try {

await api.post(
  `/posts/${postId}/comment`,
  { text }
);

     setCommentText((prev) => ({
    ...prev,
    [commentKey]: ""
    }));

    } catch (error) {
      console.error("Error comentando:", error);
    }

  };

  /* ========================== 🗑️ ELIMINAR COMENTARIO ========================== */

  const handleDeleteComment = async (postId, commentId) => {

    try {

await api.delete(
  `/posts/${postId}/comment/${commentId}`
);

    } catch (error) {
      console.error("Error eliminando comentario:", error);
    }

  };

  /* ========================== ❤️ LIKE COMENTARIO ========================== */

  const handleLikeComment = async (postId, commentId) => {

    try {

await api.put(
  `/posts/${postId}/comment/${commentId}/like`
);

    } catch (error) {
      console.error("Error likear comentario:", error);
    }

  };

  /* ========================== UTILIDADES ========================== */

  const formatDate = (d) =>
    new Date(d).toLocaleString();

  if (!token) return <p>No autorizado</p>;

return (
  <>

    <div className="container">
      <h1 className="title">Feed</h1>

      <Button onClick={() => setDarkMode(prev => !prev)}>
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </Button>

      <div className="top-bar">
        <Link to="/messages">
          <Button variant="action">
            💬 Mensajes {messageCount > 0 ? `(${messageCount})` : ""}
          </Button>
        </Link>

        <Link to="/notification">
          <Button variant="action">
            🔔 Notificaciones{" "}
            {notificationCount > 0 ? `(${notificationCount})` : ""}
          </Button>
        </Link>

        <Link to="/profile/me" className="profile-link">
          Mi perfil
        </Link>

        <Button
          variant="danger"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          🚪 Cerrar sesión
        </Button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />

        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((user) => (
              <Link
                key={user._id}
                to={`/profile/${user.username}`}
                onClick={() => {
                  setSearchText("");
                  setSearchResults([]);
                }}
                className="search-item"
              >
                <img
                  src={
                    getImageUrl(user.avatar)
                  }
                  alt={user.username}
                  className="search-avatar"
                />

                <span className="search-username">
                  {user.username}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="post-form"
      >
        <textarea
          placeholder="¿Qué estás pensando?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {image && (
          <div className="image-preview">
            <img
              src={URL.createObjectURL(image)}
              alt="preview"
            />

            <button
              type="button"
              onClick={removeImage}
              className="remove-image"
            >
              ✕
            </button>
          </div>
        )}

        <div className="post-form-actions">
          <label className="image-upload">
            🖼️

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>

          <Button type="submit">
            Publicar
          </Button>
        </div>
      </form>

      <hr />

      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          userId={userId}
          commentText={commentText}
          setCommentText={setCommentText}
          handleLike={handleLike}
          handleDelete={handleDelete}
          handleLikeComment={handleLikeComment}
          handleDeleteComment={handleDeleteComment}
          handleComment={handleComment}
          handleRepost={handleRepost}
          formatDate={formatDate}
        />
      ))}

      <ChatWidget currentUser={user} />
    </div>
  </>
) };