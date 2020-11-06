import React, { useState, useEffect, useRef } from "react";
import Post from "./components/Post";
import ImageUpload from "./components/ImageUpload";
import {
  Modal,
  Button,
  Input,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import { auth, db } from "./firebase";
import "./App.css";

const instaLogo =
  "https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png";

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [posts, setPosts] = useState([]);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [openNewPost, setOpenNewPost] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const scrollPos = useRef();

  useEffect(() => {
    const unsubscribe = db
      .collection("posts")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            post: doc.data(),
          }))
        );
      });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      authUser ? setUser(authUser) : setUser(null);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const signUp = (event) => {
    event.preventDefault();
    const unsubscribe = auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        authUser.user.updateProfile({ displayName: username });
        setUser(authUser);
        setOpenSignUp(false);
      })
      .catch((error) => alert(error.message));
    return () => {
      unsubscribe();
    };
  };

  const signIn = (event) => {
    event.preventDefault();
    const unsubscribe = auth
      .signInWithEmailAndPassword(email, password)
      .then((authUser) => {
        setUser(authUser);
        setOpenSignIn(false);
      })
      .catch((error) => alert(error.message));
    return () => {
      unsubscribe();
    };
  };

  const handleCloseNewPost = () => {
    setOpenNewPost(false);
  };

  return (
    <div className="app">
      <div ref={scrollPos}></div>
      <Modal
        className="app__modal"
        open={openSignUp}
        onClose={() => setOpenSignUp(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <center>
            <img src={instaLogo} alt="Logo" className="app__headerImage" />
          </center>
          <form className="app__signUp" action="">
            <Input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={signUp}>
              Sign Up
            </Button>
          </form>
        </div>
      </Modal>
      <Modal
        className="app__modal"
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <center>
            <img src={instaLogo} alt="Logo" className="app__headerImage" />
          </center>
          <form className="app__signIn" action="">
            <Input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={signIn}>
              Sign In
            </Button>
          </form>
        </div>
      </Modal>
      <Modal
        className="app__modal"
        open={openNewPost}
        onClose={() => setOpenNewPost(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <center>
            <img src={instaLogo} alt="Logo" className="app__headerImage" />
          </center>
          <ImageUpload
            username={user?.displayName}
            onCloseModal={handleCloseNewPost}
          />
        </div>
      </Modal>

      <div className="app__header">
        <img
          onClick={() =>
            scrollPos.current.scrollIntoView({ behavior: "smooth" })
          }
          src={instaLogo}
          alt="Logo"
          className="app__headerImage"
        />
        {user ? (
          <div className="app__headerLoggedIn">
            <Tooltip title="Create Post" arrow>
              <IconButton size="small" onClick={() => setOpenNewPost(true)}>
                <AddIcon />
              </IconButton>
            </Tooltip>
            <button
              className="app__headerButton"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <Avatar
                className="post__avatar"
                alt={user.displayName}
                src="/static/images/avatar/1.jpg"
              />
            </button>
          </div>
        ) : (
          <div className="app__headerLogin">
            <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
            <Button onClick={() => setOpenSignUp(true)}>Sign Up</Button>
          </div>
        )}
        <Menu
          className="app__headerMenu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => auth.signOut().then(setAnchorEl(null))}>
            Sign Out
          </MenuItem>
        </Menu>
      </div>
      <center>
        {posts.map(({ id, post }) => (
          <Post
            key={id}
            postId={id}
            postUsername={post.username}
            imageUrl={post.imageUrl}
            caption={post.caption}
            loggedInUser={user}
          />
        ))}
      </center>
    </div>
  );
}

export default App;
