import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import Button from "./Button";
import Card from "./Card";
import { getImageUrl } from "../utils/getImageUrl";

const PostCard = ({
  post,
  userId,
  commentText,
  setCommentText,
  handleLike,
  handleDelete,
  handleEditPost,
  handleLikeComment,
  handleDeleteComment,
  handleComment,
  handleRepost,
  formatDate
}) => {

  const [showAllComments, setShowAllComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const isRepost = !!post.repostedFrom;

  // Post que mostramos visualmente
  const displayedPost = isRepost
    ? post.repostedFrom
    : post;

  const isOwner = displayedPost.user?._id === userId;

  const startEditing = () => {
    setEditValue(displayedPost.content || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveEditing = async () => {
    if (!editValue.trim()) return;
    await handleEditPost(displayedPost._id, editValue.trim());
    setIsEditing(false);
  };

  const originalUser = displayedPost.user;

  // Identificador de ESTA tarjeta.
  // El repost tiene su propio _id.
  const commentKey = post._id;

  const comments = displayedPost.comments || [];

  const visibleComments = showAllComments
    ? comments
    : comments.slice(0, 3);

  const hiddenCommentsCount = comments.length - 3;

  return (
    <Card className="post">

      {/* ================= HEADER ================= */}

      <div className="post-header">

        {isRepost ? (
          <>
            <Avatar src={post.user?.avatar} />

            <div>
              <Link
                to={`/profile/${post.user?.username}`}
                className="username"
              >
                {post.user?.username}
              </Link>

              <span> 🔁 reposteó</span>
            </div>
          </>
        ) : (
          <>
            <Avatar src={post.user?.avatar} />

            <Link
              to={`/profile/${post.user?.username}`}
              className="username"
            >
              {post.user?.username}
            </Link>
          </>
        )}

      </div>


      {/* ================= POST ORIGINAL ================= */}

      {isRepost && (
        <div className="repost-original">

          <div className="post-header">

            <Avatar src={originalUser?.avatar} />

            <Link
              to={`/profile/${originalUser?.username}`}
              className="username"
            >
              {originalUser?.username}
            </Link>

          </div>

          <p className="post-content">
            {displayedPost.content}
          </p>

          {displayedPost.image && (
            <img
              src={getImageUrl(displayedPost.image)}
              alt="post"
              className="post-image"
            />
          )}

        </div>
      )}


      {/* ================= POST NORMAL ================= */}

      {!isRepost && (
        <>
          {isEditing ? (
            <div className="post-edit">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                maxLength={2000}
              />

              <div className="post-edit-actions">
                <Button onClick={saveEditing}>Guardar</Button>
                <Button variant="action" onClick={cancelEditing}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="post-content">
              {displayedPost.content}
              {displayedPost.edited && (
                <span className="edited-tag"> (editado)</span>
              )}
            </p>
          )}

          {displayedPost.image && (
            <img
              src={getImageUrl(displayedPost.image)}
              alt="post"
              className="post-image"
            />
          )}
        </>
      )}


      {/* ================= FECHA ================= */}

      <small className="date">
        {formatDate(post.createdAt)}
      </small>


      {/* ================= ACCIONES ================= */}

      <div className="post-actions">

        <Button
          variant="action"
          onClick={() => handleLike(displayedPost._id)}
        >
          {displayedPost.likes?.includes(userId)
            ? "💔"
            : "❤️"}{" "}
          {displayedPost.likes?.length || 0}
        </Button>


        {/* No mostrar repostear en nuestros propios posts */}

        {displayedPost.user?._id !== userId && (
          <Button
            variant="action"
            onClick={() =>
              handleRepost(displayedPost._id)
            }
          >
            🔁 Repostear
          </Button>
        )}


        {/* Editar: solo el texto, solo el dueño, y nunca en un repost */}

        {!isRepost && isOwner && !isEditing && (
          <Button
            variant="action"
            onClick={startEditing}
          >
            Editar
          </Button>
        )}


        {/* El repost lo puede eliminar quien lo creó */}

        {post.user?._id === userId && (
          <Button
            variant="danger"
            onClick={() =>
              handleDelete(post._id)
            }
          >
            Eliminar
          </Button>
        )}

      </div>


      {/* ================= COMENTARIOS ================= */}

      <div className="comments">

        <h4>Comentarios</h4>

        {visibleComments.map((c) => {

          const liked =
            c.likes?.includes(userId);

          return (
            <div
              key={c._id}
              className="comment"
            >

              <Link
                to={`/profile/${c.user?.username}`}
              >
                <Avatar
                  src={c.user?.avatar}
                  size="small"
                />
              </Link>

              <div>

                <Link
                  to={`/profile/${c.user?.username}`}
                  className="username"
                >
                  {c.user?.username}
                </Link>{" "}

                {c.text}

                <br />

                <small className="date">
                  {formatDate(c.createdAt)}
                </small>


                <div className="comment-actions">

                  <Button
                    variant="action"
                    onClick={() =>
                      handleLikeComment(
                        displayedPost._id,
                        c._id
                      )
                    }
                  >
                    {liked
                      ? "💔"
                      : "❤️"}{" "}
                    {c.likes?.length || 0}
                  </Button>


                  {(c.user?._id === userId ||
                    displayedPost.user?._id === userId) && (
                    <Button
                      variant="danger"
                      onClick={() =>
                        handleDeleteComment(
                          displayedPost._id,
                          c._id
                        )
                      }
                    >
                      Eliminar
                    </Button>
                  )}

                </div>

              </div>

            </div>
          );
        })}


        {/* ================= VER MÁS / OCULTAR ================= */}

        {comments.length > 3 && (
          <Button
            variant="action"
            onClick={() =>
              setShowAllComments((prev) => !prev)
            }
          >
            {showAllComments
              ? "Ocultar comentarios"
              : `Ver ${hiddenCommentsCount} ${hiddenCommentsCount === 1 ? "comentario" : "comentarios"} más`}
          </Button>
        )}


        {/* ================= TEXTAREA ================= */}

        <textarea
          placeholder="Escribe un comentario..."
          value={commentText[commentKey] || ""}
          onChange={(e) =>
            setCommentText((prev) => ({
              ...prev,
              [commentKey]: e.target.value
            }))
          }
        />


        <Button
          onClick={() =>
            handleComment(
              displayedPost._id,
              commentKey
            )
          }
        >
          Comentar
        </Button>

      </div>

    </Card>
  );
};

export default PostCard;