import { useState } from "react";
import { useDispatch } from "react-redux";
import { createSong } from "../../redux/songs";
import "../CreateSong/CreateSong.css";

const CreateSong = () => {
  const [title, setTitle] = useState("");
  const [albumId, setAlbumId] = useState(1);
  const [image, setImage] = useState(null);
  const [song, setSong] = useState(null);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const handleImageChange = (e) => setImage(e.target.files[0]);
  const handleSongChange = (e) => setSong(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !albumId || !song) {
      setError("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("album_id", albumId);
    if (image) formData.append("image", image);
    formData.append("song", song); // Fixed key name to match backend

    try {
      const response = await dispatch(createSong(formData));

      if (response?.payload?.error) {
        setError(response.payload.error); // Show backend error message
      } else {
        alert("Song created successfully!");
        setTitle("");
        setAlbumId(1);
        setImage(null);
        setSong(null);
        setError(null);
      }
    } catch (err) {
      setError("An error occurred while creating the song.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      <label>Title</label>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

      <label>Album ID</label>
      <input type="number" value={albumId} onChange={(e) => setAlbumId(Number(e.target.value))} required />

      <label>Upload Image (Optional)</label>
      <input type="file" onChange={handleImageChange} accept="image/*" />

      <label>Upload Song</label>
      <input type="file" onChange={handleSongChange} accept="audio/*" required />

      <button type="submit">Upload Song</button>
    </form>
  );
};

export default CreateSong;
