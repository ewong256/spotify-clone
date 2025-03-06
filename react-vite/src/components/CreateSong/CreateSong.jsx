import { useState } from "react";
import { useDispatch } from "react-redux";
import { createSong } from "../../redux/songs";
import "../CreateSong/CreateSong.css";

const CreateSong = () => {
  const [title, setTitle] = useState("");
  const [albumId, setAlbumId] = useState(1);
  const [image, setImage] = useState(null);
  const [songFile, setSongFile] = useState(null);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const handleImageChange = (e) => setImage(e.target.files[0]);
  const handleSongChange = (e) => setSongFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!songFile) {
      setError("Please select a song file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("album_id", albumId);
    formData.append("song", songFile); // ✅ Match Flask backend expected key

    if (image) {
      formData.append("image", image); // ✅ If user uploads an image, send it
    }

    try {
      const response = await dispatch(createSong(formData));

      if (response?.payload?.song) {
        alert("Song uploaded successfully!");
        setTitle("");
        setAlbumId(1);
        setImage(null);
        setSongFile(null);
        setError(null);
      } else {
        setError("Failed to upload song.");
      }
    } catch (err) {
      setError("An error occurred while uploading the song.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Song Title"
        required
      />

      <input
        type="number"
        value={albumId}
        onChange={(e) => setAlbumId(Number(e.target.value))}
        placeholder="Album ID"
        required
      />

      <input type="file" accept="image/*" onChange={handleImageChange} />
      <input type="file" accept="audio/*" onChange={handleSongChange} required />

      <button type="submit">Upload Song</button>
    </form>
  );
};

export default CreateSong;
