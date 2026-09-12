import { useEffect } from "react";
import socket from "../socket";

export default function usePostSocket(setPosts) {

  useEffect(() => {

    // =========================
    // NUEVO POST
    // =========================

    const handleNewPost = (post) => {

      setPosts((prev) => {

        if (prev.some((p) => p._id === post._id)) {
          return prev;
        }

        return [post, ...prev];

      });

    };


    // =========================
    // LIKE DE POST
    // =========================

    const handlePostLiked = ({ postId, likes }) => {

      setPosts((prev) =>
        prev.map((p) => {

          // Post original
          if (p._id === postId) {

            return {
              ...p,
              likes
            };

          }


          // Repost del post original
          if (p.repostedFrom?._id === postId) {

            return {
              ...p,

              repostedFrom: {
                ...p.repostedFrom,
                likes
              }

            };

          }


          return p;

        })
      );

    };


    // =========================
    // NUEVO COMENTARIO
    // =========================

    const handlePostCommented = ({
      postId,
      comment
    }) => {

      setPosts((prev) =>
        prev.map((p) => {

          // Comentario sobre el post original
          if (p._id === postId) {

            return {
              ...p,

              comments: [
                ...(p.comments || []),
                comment
              ]

            };

          }


          // Comentario sobre el post original
          // mostrado dentro de un repost
          if (p.repostedFrom?._id === postId) {

            return {
              ...p,

              repostedFrom: {
                ...p.repostedFrom,

                comments: [
                  ...(p.repostedFrom.comments || []),
                  comment
                ]

              }

            };

          }


          return p;

        })
      );

    };


    // =========================
    // LIKE DE COMENTARIO
    // =========================

    const handleCommentLiked = ({
      postId,
      commentId,
      likes
    }) => {

      setPosts((prev) =>
        prev.map((p) => {

          // Comentario del post normal
          if (p._id === postId) {

            return {
              ...p,

              comments: (p.comments || []).map((comment) =>
                comment._id === commentId
                  ? {
                      ...comment,
                      likes
                    }
                  : comment
              )

            };

          }


          // Comentario del post original
          // mostrado dentro de un repost
          if (p.repostedFrom?._id === postId) {

            return {
              ...p,

              repostedFrom: {
                ...p.repostedFrom,

                comments: (p.repostedFrom.comments || []).map(
                  (comment) =>
                    comment._id === commentId
                      ? {
                          ...comment,
                          likes
                        }
                      : comment
                )

              }

            };

          }


          return p;

        })
      );

    };


    // =========================
    // ELIMINAR COMENTARIO
    // =========================

    const handleCommentDeleted = ({
      postId,
      commentId
    }) => {

      setPosts((prev) =>
        prev.map((p) => {

          // Comentario de post normal
          if (p._id === postId) {

            return {
              ...p,

              comments: (p.comments || []).filter(
                (comment) =>
                  comment._id !== commentId
              )

            };

          }


          // Comentario del original
          // mostrado dentro de un repost
          if (p.repostedFrom?._id === postId) {

            return {
              ...p,

              repostedFrom: {
                ...p.repostedFrom,

                comments: (
                  p.repostedFrom.comments || []
                ).filter(
                  (comment) =>
                    comment._id !== commentId
                )

              }

            };

          }


          return p;

        })
      );

    };


    // =========================
    // NUEVO REPOST
    // =========================

    const handlePostReposted = (repost) => {

      setPosts((prev) => {

        if (
          prev.some(
            (p) => p._id === repost._id
          )
        ) {
          return prev;
        }

        return [
          repost,
          ...prev
        ];

      });

    };


    // =========================
    // ELIMINAR POST
    // =========================

    const handlePostDeleted = ({ postId }) => {

      setPosts((prev) =>
        prev.filter(
          (p) => p._id !== postId
        )
      );

    };


    // =========================
    // LISTENERS
    // =========================

    socket.on(
      "newPost",
      handleNewPost
    );

    socket.on(
      "postLiked",
      handlePostLiked
    );

    socket.on(
      "postCommented",
      handlePostCommented
    );

    socket.on(
      "commentLiked",
      handleCommentLiked
    );

    socket.on(
      "commentDeleted",
      handleCommentDeleted
    );

    socket.on(
      "postReposted",
      handlePostReposted
    );

    socket.on(
      "postDeleted",
      handlePostDeleted
    );


    // =========================
    // CLEANUP
    // =========================

    return () => {

      socket.off(
        "newPost",
        handleNewPost
      );

      socket.off(
        "postLiked",
        handlePostLiked
      );

      socket.off(
        "postCommented",
        handlePostCommented
      );

      socket.off(
        "commentLiked",
        handleCommentLiked
      );

      socket.off(
        "commentDeleted",
        handleCommentDeleted
      );

      socket.off(
        "postReposted",
        handlePostReposted
      );

      socket.off(
        "postDeleted",
        handlePostDeleted
      );

    };

  }, [setPosts]);

}
