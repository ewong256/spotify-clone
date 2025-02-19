import { useState } from "react";
import { useDispatch } from "react-redux";
import { createSong } from "../../redux/songs";
import "../CreateSong/CreateSong.css";

const CreateSong = () => {
  const [title, setTitle] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [albumId, setAlbumId] = useState(1);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("song_url", songUrl);
    formData.append("album_id", albumId);
    formData.append("file", file);

    try {
      const response = await dispatch(createSong(formData));

      if (response?.payload?.id) {
        alert("Song uploaded successfully!");
        setTitle("");
        setSongUrl("");
        setAlbumId(1);
        setFile(null);
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
        type="url"
        value={songUrl}
        onChange={(e) => setSongUrl(e.target.value)}
        placeholder="Song URL"
        required
      />
      <input
        type="number"
        value={albumId}
        onChange={(e) => setAlbumId(Number(e.target.value))}
        placeholder="Album ID"
        required
      />
      <input type="file" onChange={handleFileChange} required />
      <button type="submit">Upload Song</button>
    </form>
  );
};

export default CreateSong;
