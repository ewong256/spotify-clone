import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AlbumPage.css";

const AlbumPage = () => {
  const { albumId } = useParams();
  const navigate = useNavigate(); // Hook for navigation
  const [albumData, setAlbumData] = useState(null);
  const [username, setUsername] = useState(""); // Store owner's username
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false); // State for unauthorized access

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        const response = await fetch(`http://localhost:5173/api/albums/${albumId}`, {
          credentials: "include", // Ensures cookies/session are sent if authentication is required
        });

        if (response.status === 401) {
          setUnauthorized(true);
          throw new Error("Unauthorized - Please log in.");
        }

        if (!response.ok) throw new Error(`Failed to fetch album (status: ${response.status})`);

        const data = await response.json();
        console.log("Album Data:", data);
        setAlbumData(data);

        // Fetch username using user_id
        if (data.user_id) {
          const userResponse = await fetch(`http://localhost:5173/api/users/${data.user_id}`);

          if (userResponse.status === 401) {
            setUnauthorized(true);
            throw new Error("Unauthorized - Please log in.");
          }

          if (!userResponse.ok) throw new Error("Failed to fetch user");

          const userData = await userResponse.json();
          console.log("User Data:", userData);
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

  if (unauthorized) return <div className="error">Unauthorized - Please log in.</div>;
  if (loading) return <div className="loading">Loading album...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const handlePlay = (songUrl) => {
    if (currentSong === songUrl) {
      setCurrentSong(null);
    } else {
      setCurrentSong(songUrl);
      const audio = new Audio(songUrl);
      audio.play();
    }
  };

  const handleCreateAlbum = () => {
    navigate("/create-album"); // Redirects to the album creation page
  };

  return (
    <div className="album-container">
      <div className="album-header">
        <div className="album-cover">
          <img src={albumData.image_url} alt={`${albumData.title} cover`} />
        </div>
        <div className="album-info">
          <h2>{albumData.title}</h2>
          <p className="owner">By {username ? username : "Unknown Artist"}</p>
        </div>
      </div>

      <div className="controls">
        <button className="play-btn">▶ Play</button>
        <button className="more-btn">⋮</button>
      </div>

      <div className="tracklist">
        {albumData.songs.map((song, index) => (
          <div key={song.id} className="track">
            <span className="track-number">{index + 1}</span>
            <span className="track-title">{song.title}</span>
            <button className="track-play-btn" onClick={() => handlePlay(song.song_url)}>
              {currentSong === song.song_url ? "⏸ Pause" : "▶ Play"}
            </button>
          </div>
        ))}
      </div>

      {/* Create Your Own Album Button */}
      <div className="create-album-container">
        <button className="create-album-btn" onClick={handleCreateAlbum}>
          Create Your Own Album
        </button>
      </div>
    </div>
  );
};

export default AlbumPage;
