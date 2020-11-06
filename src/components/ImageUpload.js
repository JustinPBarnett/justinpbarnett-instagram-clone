import React, { useState } from "react";
import { Button, LinearProgress, Typography, Box } from "@material-ui/core";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import { storage, db } from "../firebase";
import firebase from "firebase";
import "../styles/ImageUpload.css";

function ImageUpload({ username, onCloseModal = false }) {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [dropAreaClass, setDropAreaClass] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validateFile = (file) => {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/x-icon",
    ];
    if (validTypes.indexOf(file.type) === -1) {
      setErrorMessage("File type not permitted.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleChange = (e) => {
    if (e?.target?.files?.length > 0) {
      setImage(e.target.files[0]);
      setFileUrl(URL.createObjectURL(e.target.files[0]));
    } else if (e?.dataTransfer?.files?.length > 0) {
      setImage(e.dataTransfer.files[0]);
      setFileUrl(URL.createObjectURL(e.dataTransfer.files[0]));
    }
    console.log(fileUrl);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDropAreaClass("imageUpload--hovering");
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDropAreaClass("imageUpload--hovering");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDropAreaClass("");
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDropAreaClass("");
    handleChange(e);
  };

  const handleClearImage = () => {
    setImage(null);
    setFileUrl("");
  };

  const handleUpload = () => {
    if (validateFile(image)) {
      const uploadTask = storage.ref(`images/${image.name}`).put(image);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progress);
        },
        (error) => {
          console.log(error);
        },
        () => {
          storage
            .ref("images")
            .child(image.name)
            .getDownloadURL()
            .then((url) => {
              db.collection("posts").add({
                username: username,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                caption: caption,
                imageUrl: url,
              });
              setProgress(0);
              onCloseModal(true);
              window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
            });
        }
      );
    }
  };

  return (
    <div onCloseModal={onCloseModal} className="imageUpload">
      {image && (
        <div className="imageUpload__x">
          <span onClick={handleClearImage}>x</span>
        </div>
      )}
      <img className="imageUpload__preview" src={fileUrl} />
      <div
        className={`imageUpload__dropZone ${
          image && "imageUpload--hidden"
        } ${dropAreaClass}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleFileDrop}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <div className="imageUpload__uploadIcon">
          <CloudUploadIcon />
        </div>
        <h4>Drag & Drop file here or click to upload</h4>
      </div>
      <input
        id="fileInput"
        className="imageUpload__fileSelect"
        type="file"
        onChange={handleChange}
        hidden
      />
      <textarea
        className="imageUpload__caption"
        rows={4}
        multiline
        placeholder="Enter a caption..."
        onChange={(e) => setCaption(e.target.value)}
        value={caption}
      />
      <Button
        className={`imageUpload__postButton ${
          progress > 0 && "imageUpload--hidden"
        }`}
        disabled={!caption || !image || progress > 0}
        onClick={handleUpload}
      >
        Post
      </Button>
      {progress > 0 && (
        <div className="imageUpload__progress">
          <Box display="flex" alignItems="center">
            <Box width="100%" mr={1}>
              <LinearProgress
                variant="determinate"
                value={progress}
                max="100"
              />
            </Box>
            <Box minWidth={35}>
              <Typography variant="body2" color="textSecondary">
                {`${Math.round(progress)}%`}
              </Typography>
            </Box>
          </Box>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
