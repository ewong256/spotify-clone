import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import "./AlbumsList.css";

const AlbumsList = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [albums, setAlbums] = useState([]); // Store the albums list
  const [message, setMessage] = useState(""); // Message for errors

  // Fetch albums from the backend when the component mounts
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch("/api/albums"); // Adjust the API endpoint as needed
        const data = await response.json();

        if (response.ok) {
          setAlbums(data); // Set albums data in state
        } else {
          setMessage("Failed to fetch albums.");
        }
      } catch (error) {
        console.error("Error fetching albums:", error);
        setMessage("Error fetching albums.");
      }
    };

    fetchAlbums();
  }, []);

  // Redirect to the album page when an album card is clicked
  const handleAlbumClick = (albumId) => {
    navigate(`/album/${albumId}`);
  };

  return (
    <div className="albums-container">
      <h2>Albums</h2>
      {message && <p className="error">{message}</p>}
      <div className="albums-list">
        {albums.length > 0 ? (
          albums.map((album) => (
            <div
              key={album.id}
              className="album-card"
              onClick={() => handleAlbumClick(album.id)}
            >
              <img src={album.image_url} alt={`${album.title} cover`} className="album-cover" />
              <div className="album-info">
                <h3>{album.title}</h3>
                <p>{album.artist_name}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No albums available.</p>
        )}
      </div>
    </div>
  );
};

export default AlbumsList;
