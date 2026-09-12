import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import socket from "../socket";
import api from "../api/api";

import PostCard from "../components/PostCard";
import ProfileHeader from "../components/ProfileHeader";
import ProfileStats from "../components/ProfileStats";
import FollowersModal from "../components/FollowersModal";
import ProfileEdit from "../components/ProfileEdit";

import { useProfile } from "../hooks/useProfile";

import "../styles/Profile.css";

export default function Profile() {

  const { username } = useParams();
  const token = localStorage.getItem("token");

  const currentUserId = token
    ? JSON.parse(atob(token.split(".")[1])).id
    : null;

  // =========================
  // USER (HOOK)
  // =========================
  const { user, setUser, fetchUser } = useProfile(username, token);

  // =========================
  // STATES
  // =========================
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [editing, setEditing] = useState(false);

  // =========================
  // RESET AL CAMBIAR DE PERFIL
  // =========================
  useEffect(() => {
    setEditing(false);
    setShowFollowers(false);
    setShowFollowing(false);
    setCommentText({});
  }, [username]);

  // =========================
  // FETCH POSTS
  // =========================
  const fetchPosts = async () => {
    if (!user?._id) return;

    try {
      const data = await api.get(
        `/posts/user/${user._id}`
      );

      setPosts(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error("Error obteniendo posts:", error);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  // =========================
  // SOCKET
  // =========================
  useEffect(() => {

    socket.on("postDeleted", (postId) => {

      setPosts(prev =>
        prev.filter(p => p._id !== postId)
      );

    });

    return () => {
      socket.off("postDeleted");
    };

  }, []);

  // =========================
  // POST ACTIONS
  // =========================
  const handleLike = async (postId) => {

    await api.put(
      `/posts/like/${postId}`
    );

    fetchPosts();
  };

  const handleLikeComment = async (
    postId,
    commentId
  ) => {

    await api.put(
      `/posts/${postId}/comment/${commentId}/like`
    );

    fetchPosts();
  };

  const handleComment = async (postId) => {

    const text = commentText[postId];

    if (!text?.trim()) return;

    await api.post(
      `/posts/${postId}/comment`,
      { text }
    );

    setCommentText(prev => ({
      ...prev,
      [postId]: ""
    }));

    fetchPosts();
  };

  const deleteComment = async (
    postId,
    commentId
  ) => {

    await api.delete(
      `/posts/${postId}/comment/${commentId}`
    );

    setPosts(prev =>
      prev.map(post =>
        post._id === postId
          ? {
              ...post,
              comments: post.comments.filter(
                c => c._id !== commentId
              )
            }
          : post
      )
    );
  };

  const deletePost = async (postId) => {

    await api.delete(
      `/posts/${postId}`
    );

    setPosts(prev =>
      prev.filter(p => p._id !== postId)
    );
  };

  // =========================
  // FOLLOW
  // =========================
  const isFollowing = user?.followers?.some(
    f => f._id === currentUserId
  );

  const handleFollow = async () => {

    await api.put(
      `/users/follow/${user._id}`
    );

    // actualización optimista
    setUser(prev => ({
      ...prev,
      followers: isFollowing
        ? prev.followers.filter(
            f => f._id !== currentUserId
          )
        : [
            ...prev.followers,
            { _id: currentUserId }
          ]
    }));
  };

  // =========================
  // FLAGS
  // =========================
  const isOwnProfile =
    user && user._id === currentUserId;

  if (!user) {
    return <p>Cargando...</p>;
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="profile-page">

      <Link
        to="/feed"
        className="back-button"
      >
        ← Volver al feed
      </Link>

      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        onEdit={() => setEditing(true)}
        onFollow={handleFollow}
        isFollowing={isFollowing}
      />

      {editing && (
        <ProfileEdit
          user={user}
          token={token}
          onClose={() => setEditing(false)}
          onUserUpdate={fetchUser}
        />
      )}

      <ProfileStats
        followers={user.followers}
        following={user.following}
        onFollowersClick={() =>
          setShowFollowers(true)
        }
        onFollowingClick={() =>
          setShowFollowing(true)
        }
      />

      {showFollowers && (
        <FollowersModal
          title="Seguidores"
          users={user.followers}
          onClose={() =>
            setShowFollowers(false)
          }
        />
      )}

      {showFollowing && (
        <FollowersModal
          title="Siguiendo"
          users={user.following}
          onClose={() =>
            setShowFollowing(false)
          }
        />
      )}

      <h2 className="profile-posts-title">
        Posts
      </h2>

      <div className="profile-posts">

        {posts.length === 0 ? (
          <p className="empty">
            No hay posteos
          </p>
        ) : (
          posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              userId={currentUserId}
              commentText={commentText}
              setCommentText={setCommentText}
              handleLike={handleLike}
              handleDelete={deletePost}
              handleLikeComment={handleLikeComment}
              handleDeleteComment={deleteComment}
              handleComment={handleComment}
              formatDate={(d) =>
                new Date(d).toLocaleString()
              }
            />
          ))
        )}

      </div>

    </div>
  );
}