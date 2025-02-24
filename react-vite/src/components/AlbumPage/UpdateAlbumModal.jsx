import React, { useState } from "react";
import "./UpdateAlbumModal.css";

const UpdateAlbumModal = ({ showModal, setShowModal, albumData, albumId, setAlbumData }) => {
  const [newTitle, setNewTitle] = useState(albumData?.title || "");
  const [newSongId, setNewSongId] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState(""); // Changed from file to URL input
  const [error, setError] = useState("");

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", newTitle);
    if (newSongId) formData.append("song_id", newSongId);
    if (newImageUrl) formData.append("image_url", newImageUrl); // Sending URL instead of a file

    try {
      const response = await fetch(`/api/albums/${albumId}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const updatedAlbum = await response.json();
        setAlbumData(updatedAlbum.album);
        setShowModal(false); // Close modal on success
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update album.");
      }
    } catch (error) {
      setError("An error occurred while updating the album.");
    }
  };

  if (!showModal) return null; // Don't render if modal is closed

  return (
    <div className="update-album-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Update Album</h2>
          <button className="modal-close-btn" onClick={() => setShowModal(false)}>×</button>
        </div>

        <form onSubmit={handleUpdateSubmit} className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <label>
            Title:
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </label>

          <label>
            Song:
            <select
              value={newSongId || ""}
              onChange={(e) => setNewSongId(e.target.value)}
            >
              <option value="">Select a song</option>
              {albumData.songs.map((song) => (
                <option key={song.id} value={song.id}>
                  {song.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Image URL:
            <input
              type="text"
              placeholder="Enter image URL"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
            />
          </label>

          <div className="modal-buttons">
            <button type="submit">Update</button>
            <button type="button" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAlbumModal;
