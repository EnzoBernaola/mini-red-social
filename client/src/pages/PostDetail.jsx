import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import PostCard from "../components/PostCard";
import api from "../api/api";

export default function PostDetail() {

  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const [commentText, setCommentText] = useState({});

  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).id : null;


  const fetchPost = async () => {

    try {

      const data = await api.get(
        `/posts/${postId}`
      );

      setPost(data);


    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchPost();

  }, [postId]);



  const handleLike = async () => {

    await api.put(
      `/posts/like/${post._id}`
    );

    fetchPost();

  };



  const handleLikeComment = async (
    postId,
    commentId
  ) => {

    await api.put(
      `/posts/${postId}/comment/${commentId}/like`
    );

    fetchPost();

  };



  const handleComment = async (
    postId
  ) => {

    const text = commentText[postId];


    if (!text?.trim()) return;



    await api.post(
      `/posts/${postId}/comment`,
      {
        text
      }
    );


    setCommentText(prev => ({
      ...prev,
      [postId]: ""
    }));


    fetchPost();

  };



  const handleDeleteComment = async (
    postId,
    commentId
  ) => {


    await api.delete(
      `/posts/${postId}/comment/${commentId}`
    );


    fetchPost();

  };


  const handleDelete = async (id) => {

    try {

      await api.delete(`/posts/${id}`);

      // Ya no queda nada que mostrar en esta página
      navigate("/feed");

    } catch (error) {
      console.error("Error eliminando post:", error);
    }

  };


  const handleRepost = async (id) => {

    try {

      await api.post(`/posts/${id}/repost`);

      fetchPost();

    } catch (error) {
      console.error("Error haciendo repost:", error);
    }

  };


  const handleEditPost = async (id, content) => {

    try {

      await api.put(`/posts/${id}`, { content });

      fetchPost();

    } catch (error) {
      console.error("Error editando post:", error);
    }

  };



  if (loading) {
    return <p>Cargando...</p>;
  }


  if (!post) {
    return <p>Post no encontrado</p>;
  }
  return (

    <div className="post-detail-page">

      <Link
        to="/notification"
        className="back-button"
      >
        ← Volver a notificaciones
      </Link>

      <PostCard
        post={post}
        userId={userId}
        commentText={commentText}
        setCommentText={setCommentText}
        handleLike={handleLike}
        handleDelete={handleDelete}
        handleRepost={handleRepost}
        handleEditPost={handleEditPost}
        handleLikeComment={handleLikeComment}
        handleDeleteComment={handleDeleteComment}
        handleComment={handleComment}
        formatDate={(d) =>
          new Date(d).toLocaleString()
        }
      />

    </div>
  );
}