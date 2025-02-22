import { useState, useEffect } from "react";
import "./CreateAlbum.css";

const CreateAlbum = () => {
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null); // Store image file
  const [numSongs, setNumSongs] = useState(1); // Default to 1 song
  const [availableSongs, setAvailableSongs] = useState([]); // Store available songs from database
  const [selectedSongs, setSelectedSongs] = useState([]); // Store selected song IDs
  const [message, setMessage] = useState("");

  // Fetch available songs from the backend when the component mounts
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch("/api/albums/songs");
        const data = await response.json();
        if (response.ok) {
          setAvailableSongs(data);
        } else {
          setMessage("Failed to fetch available songs.");
        }
      } catch (error) {
        console.error("Error fetching songs:", error);
        setMessage("Error fetching available songs.");
      }
    };

    fetchSongs();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);

    if (imageFile) {
      formData.append("image", imageFile); // Append actual image file
    }

    // Append selected song IDs (from dropdown)
    selectedSongs.forEach((songId, index) => {
      formData.append("song_id", songId); // Send song ID to backend
    });

    try {
      const response = await fetch("/api/albums", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.error || "Something went wrong"}`);
      } else {
        setMessage("Album created successfully!");
        setTitle("");
        setImageFile(null);
        setSelectedSongs([]); // Reset song selections
        setNumSongs(1);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("An error occurred while uploading.");
    }
  };

  return (
    <div className="album-manager">
      <h2>Create a New Album</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Album Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        {/* File input for image */}
        <label>
          Upload Album Cover:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            required
          />
        </label>

        {/* Number of Songs */}
        <label>
          Number of Songs:
          <input
            type="number"
            min="1"
            value={numSongs}
            onChange={(e) => {
              setNumSongs(parseInt(e.target.value));
              setSelectedSongs([]); // Reset selected songs
            }}
            required
          />
        </label>

        {/* Dynamic selection for songs */}
        {Array.from({ length: numSongs }).map((_, index) => (
          <label key={index}>
            Select Song {index + 1}:
            <select
              value={selectedSongs[index] || ""}
              onChange={(e) => {
                const newSelectedSongs = [...selectedSongs];
                newSelectedSongs[index] = e.target.value;
                setSelectedSongs(newSelectedSongs);
              }}
              required
            >
              <option value="">Select a song</option>
              {availableSongs.map((song) => (
                <option key={song.id} value={song.id}>
                  {song.title} by {song.artist}
                </option>
              ))}
            </select>
          </label>
        ))}

        <button type="submit">Create Album</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateAlbum;
