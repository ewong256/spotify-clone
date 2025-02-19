import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateSong } from "../../redux/songs";
import "../UpdateSong/UpdateSong.css";

const UpdateSong = ({ song, closeModal }) => {
  const dispatch = useDispatch();

  const [title, setTitle] = useState(song.title);
  const [songUrl, setSongUrl] = useState(song.song_url || "");
  const [albumId, setAlbumId] = useState(song.album_id || 1);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTitle(song.title);
    setSongUrl(song.song_url || "");
    setAlbumId(song.album_id || 1);
  }, [song]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file && !title && !songUrl && !albumId) {
      setError("Please make sure to fill in all required fields or select a file to update.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("song_url", songUrl);
    formData.append("album_id", albumId);
    if (file) formData.append("file", file);

    try {
      const response = await dispatch(updateSong(song.id, formData));

      if (response?.payload?.id) {
        alert("Song updated successfully!");
        closeModal();
      } else {
        setError("Failed to update song.");
      }
    } catch (err) {
      setError("An error occurred while updating the song.");
    }
  };

  return (
    <div className="update-song-modal">
      <div className="modal-content">
        <h2>Update Song</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
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
          <input type="file" onChange={handleFileChange} />
          <button type="submit">Update Song</button>
          <button type="button" className="close-btn" onClick={closeModal}>
            Close
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateSong;
