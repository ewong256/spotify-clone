import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateSong } from "../../redux/songs";
import "../UpdateSong/UpdateSong.css";

const UpdateSong = ({ song, closeModal }) => {
  const dispatch = useDispatch();


  const [title, setTitle] = useState(song.title);
  const [image, setImage] = useState(null);
  const [songFile, setSongFile] = useState(null);
  const [error, setError] = useState(null);

  // Handling form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);

    if (image) {
      formData.append("image", image);
    }
    if (songFile) {
      formData.append("song", songFile);
    }

    try {
      // Dispatch the updateSong action to update the song
      await dispatch(updateSong(song.id, formData));

      // Close the modal after successful update
      closeModal();
    } catch (error) {
      setError("Failed to update song.");
    }
  };

  return (
    <div className="update-song-modal">
      <div className="modal-content">
        <h2>Update Song</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="image">Image</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>

          <div>
            <label htmlFor="song">Song File</label>
            <input
              type="file"
              id="song"
              accept="audio/*"
              onChange={(e) => setSongFile(e.target.files[0])}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="submit-btn">Update Song</button>
            <button type="button" className="close-btn" onClick={closeModal}>Close</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSong;
