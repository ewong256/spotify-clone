import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./AlbumPage.css";
import UpdateAlbumModal from "./UpdateAlbumModal";

const AlbumPage = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const [albumData, setAlbumData] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for showing the update modal

  const currentUser = useSelector((state) => state.session.user); // Get logged-in user from Redux

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        const response = await fetch(`/api/albums/${albumId}`, {
          credentials: "include",
        });

        if (response.status === 401) {
          setUnauthorized(true);
          throw new Error("Unauthorized - Please log in.");
        }

        if (!response.ok) throw new Error(`Failed to fetch album (status: ${response.status})`);

        const data = await response.json();
        setAlbumData(data);

        if (data.user_id) {
          const userResponse = await fetch(`/api/users/${data.user_id}`);
          if (!userResponse.ok) throw new Error("Failed to fetch user");

          const userData = await userResponse.json();
          setUsername(userData.username);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumData();
  }, [albumId]);

  const handlePlay = (songUrl) => {
    if (currentSong === songUrl) {
      setCurrentSong(null);
    } else {
      setCurrentSong(songUrl);
      const audio = new Audio(songUrl);
      audio.play();
    }
  };

  const handleDeleteAlbum = async () => {
    try {
      const response = await fetch(`/api/albums/${albumId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/albums"); // Redirect after deletion
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete album.");
      }
    } catch (error) {
      setError("An error occurred while deleting the album.");
    }
  };

  if (unauthorized) return <div className="error">Unauthorized - Please log in.</div>;
  if (loading) return <div className="loading">Loading album...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="album-container">
      <div className="album-header">
        <div className="album-cover">
          <img src={albumData.image_url} alt={`${albumData.title} cover`} />
        </div>
        <div className="album-info">
          <h2>{albumData.title}</h2>
          <p className="owner">By {username || "Unknown Artist"}</p>
        </div>
      </div>

      <div className="controls">
        <button className="play-btn">▶ Play</button>
        <button className="more-btn">⋮</button>
      </div>

      <div className="tracklist">
        {Array.isArray(albumData.songs) && albumData.songs.length > 0 ? (
          albumData.songs.map((song, index) => (
            <div key={song.id} className="track">
              <span className="track-number">{index + 1}</span>
              <span className="track-title">{song.title}</span>
              <button className="track-play-btn" onClick={() => handlePlay(song.song_url)}>
                {currentSong === song.song_url ? "⏸ Pause" : "▶ Play"}
              </button>
            </div>
          ))
        ) : (
          <p>No songs available for this album.</p>
        )}
      </div>

      <div className="album-actions">
        {currentUser && (
          <>
            <button className="delete-album-btn" onClick={handleDeleteAlbum}>
              🗑️ Delete Album
            </button>
            <button className="update-album-btn" onClick={() => setShowModal(true)}>
              ✏️ Update Album
            </button>
          </>
        )}
        <button className="create-album-btn" onClick={() => navigate("/create-album")}>
          Create Your Own Album
        </button>
      </div>

      {/* Update Album Modal */}
      <UpdateAlbumModal
        showModal={showModal}
        setShowModal={setShowModal}
        albumData={albumData}
        albumId={albumId}
        setAlbumData={setAlbumData}
      />
    </div>
  );
};

export default AlbumPage;
