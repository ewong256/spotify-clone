import { useState } from "react";
import "./CreateAlbum.css";

const CreateAlbum = () => {
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null); // Store image file
  const [numSongs, setNumSongs] = useState(1); // Default to 1 song
  const [songFiles, setSongFiles] = useState([]); // Store song files
  const [message, setMessage] = useState("");

  // Handle file changes
  const handleFileChange = (e, setFile) => {
    setFile(e.target.files[0]); // Store the selected file
  };

  // Handle song file changes dynamically
  const handleSongFileChange = (e, index) => {
    const files = [...songFiles];
    files[index] = e.target.files[0]; // Store file at index
    setSongFiles(files);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);

    if (imageFile) {
      formData.append("image", imageFile); // Append actual image file
    }

    // Append song files
    songFiles.forEach((file, index) => {
      if (file) {
        formData.append(`audio`, file); // Your Flask backend expects "audio"
      }
    });

    try {
      const response = await fetch("/api/albums", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.error || "Something went wrong"}`);
      } else {
        setMessage("Album created successfully!");
        setTitle("");
        setImageFile(null);
        setSongFiles([]);
        setNumSongs(1);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("An error occurred while uploading.");
    }
  };

  return (
    <div className="album-manager">
      <h2>Create a New Album</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Album Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        {/* File input for image */}
        <label>
          Upload Album Cover:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setImageFile)}
            required
          />
        </label>

        {/* Number of Songs */}
        <label>
          Number of Songs:
          <input
            type="number"
            min="1"
            value={numSongs}
            onChange={(e) => {
              setNumSongs(parseInt(e.target.value));
              setSongFiles([]); // Reset song files
            }}
            required
          />
        </label>

        {/* Dynamic file inputs for songs */}
        {Array.from({ length: numSongs }).map((_, index) => (
          <label key={index}>
            Upload Song {index + 1}:
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => handleSongFileChange(e, index)}
              required
            />
          </label>
        ))}

        <button type="submit">Create Album</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateAlbum;
