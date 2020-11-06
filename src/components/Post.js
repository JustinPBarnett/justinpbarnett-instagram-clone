import React, { useState, useEffect } from "react";
import { Avatar, Button } from "@material-ui/core";
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import ChatBubbleOutline from "@material-ui/icons/ChatBubbleOutline";
import DeleteIcon from "@material-ui/icons/Delete";
import { db } from "../firebase";
import firebase from "firebase";
import "../styles/Post.css";

function Post({ postId, postUsername, imageUrl, caption, loggedInUser }) {
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    let unsubscribe;
    if (postId) {
      unsubscribe = db
        .collection("posts")
        .doc(postId)
        .collection("comments")
        .orderBy("timestamp", "asc")
        .onSnapshot((snapshot) => {
          setComments(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              postComment: doc.data(),
            }))
          );
        });
    }
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let unsubscribe;
    if (postId) {
      unsubscribe = db
        .collection("posts")
        .doc(postId)
        .collection("likes")
        .onSnapshot((snapshot) => {
          setLikes(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              postLike: doc.data(),
            }))
          );
        });
    }
    return () => {
      unsubscribe();
    };
  }, []);

  const handleComment = (event) => {
    event.preventDefault();
    db.collection("posts").doc(postId).collection("comments").add({
      username: loggedInUser.displayName,
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    setComment("");
  };

  const focusComment = (event) => {
    const input = document.getElementById(`commentInput_${postId}`);
    input.focus();
  };

  const handleLike = (event) => {
    event.preventDefault();
    if (
      likes.filter((x) => x.postLike.username === loggedInUser?.displayName)
        .length < 1
    ) {
      db.collection("posts").doc(postId).collection("likes").add({
        username: loggedInUser.displayName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      const likeToRemove = likes.filter(
        (like) => like.postLike.username === loggedInUser?.displayName
      );
      db.collection("posts")
        .doc(postId)
        .collection("likes")
        .doc(likeToRemove[0].id)
        .delete();
    }
  };

  const handleSave = (event) => {
    event.preventDefault();
    db.collection("saved").add({
      username: loggedInUser.displayName,
      post: postId,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
  };

  const handleDelete = (event) => {
    db.collection("posts").doc(postId).delete();
  };

  return (
    <div className="post">
      <div className="post__header">
        <Avatar
          className="post__avatar"
          alt={postUsername}
          src="/static/images/avatar/1.jpg"
        />
        <h4 className="post__headerUsername">{postUsername}</h4>
        {postUsername === loggedInUser?.displayName && (
          <button onClick={handleDelete} className="post__headerDeleteButton">
            <DeleteIcon />
          </button>
        )}
      </div>
      <img className="post__image" src={imageUrl} alt="" />
      <div className="post__content">
        {loggedInUser && (
          <div className="post__actions">
            <button onClick={handleLike}>
              {likes.filter(
                (x) => x.postLike.username === loggedInUser.displayName
              ).length > 0 ? (
                <FavoriteIcon />
              ) : (
                <FavoriteBorderIcon />
              )}
            </button>
            <button onClick={focusComment}>
              <ChatBubbleOutline />
            </button>
            {/* save */}
          </div>
        )}
        <h4 className="post__text">
          {likes.length} like
          {likes?.length > 1 ? "s" : likes?.length < 1 ? "s" : ""}
        </h4>
        <h4 className="post__text">
          <strong>{postUsername}</strong>
          &nbsp;{caption}
        </h4>
        <h4 className="post__text">
          {comments?.length} comment
          {comments?.length > 1 ? "s" : comments?.length < 1 ? "s" : ""}
        </h4>
        {comments?.length > 0 &&
          comments.map(({ id, postComment }) => (
            <h4 key={id} className="post__text">
              <strong>{postComment.username}</strong>
              &nbsp;{postComment.text}
            </h4>
          ))}
      </div>
      {loggedInUser && (
        <form className="post__comment" action="">
          <input
            id={`commentInput_${postId}`}
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="post__commentInput"
          />
          <button
            type="submit"
            disabled={!comment}
            className="post__commentButton"
            onClick={handleComment}
          >
            Post
          </button>
        </form>
      )}
    </div>
  );
}

export default Post;
