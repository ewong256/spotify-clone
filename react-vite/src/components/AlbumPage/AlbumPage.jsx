import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./AlbumPage.css"; // Import CSS for styling

const AlbumPage = () => {
  const { albumId } = useParams();
  const [albumData, setAlbumData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        const response = await fetch(`http://localhost:5173/api/albums/${albumId}`);
        if (!response.ok) throw new Error(`Failed to fetch album (status: ${response.status})`);
        
        const data = await response.json();
        setAlbumData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumData();
  }, [albumId]);

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

  return (
    <div className="album-container">
      <div className="album-header">
        <div className="album-cover">
          <img src={albumData.image_url} alt={`${albumData.title} cover`} />
        </div>
        <div className="album-info">
          <h2>{albumData.title}</h2>
          <p>{albumData.songs.length} songs</p>
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
              {currentSong === song.song_url ? "⏸" : "▶"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumPage;
