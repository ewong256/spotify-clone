import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const AlbumPage = () => {
  const { albumId } = useParams(); // Get album ID from URL
  const [albumData, setAlbumData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        const response = await fetch(`http://localhost:5173/api/albums/${albumId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch album (status: ${response.status})`);
        }

        const data = await response.json();
        setAlbumData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumData();
  }, [albumId]); // Re-fetch when albumId changes

  if (loading) return <div>Loading album...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="album-container">
      <div className="album-header">
        <div className="album-cover">
          <img src={albumData.image_url} alt={`${albumData.title} cover`} />
        </div>
        <div className="album-info">
          <h2>{albumData.title}</h2>
          <p>{albumData.artist_name} • {albumData.year} • {albumData.num_songs} songs</p>
        </div>
      </div>

      <div className="controls">
        <button className="play-btn">▶</button>
        <button className="add-btn">➕</button>
        <button className="more-btn">⋮</button>
      </div>

      <div className="tracklist">
        <div className="track-header">
          <span>#</span>
          <span>Title</span>
          <span>Duration</span>
        </div>
        {albumData.tracks.map((track, index) => (
          <div key={track.id} className="track-item">
            <span>{index + 1}</span>
            <span>{track.title}</span>
            <span>{track.duration}</span>
          </div>
        ))}
      </div>

      <div className="album-footer">
        <p>Published: {albumData.date_published}</p>
        <h3>More by {albumData.artist_name}</h3>
      </div>
    </div>
  );
};

export default AlbumPage;
