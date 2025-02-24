import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./CreateAlbum.css";

const CreateAlbum = () => {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // Store image URL instead of file
  const [numSongs, setNumSongs] = useState(1); // Default to 1 song
  const [availableSongs, setAvailableSongs] = useState([]); // Store available songs from database
  const [selectedSongs, setSelectedSongs] = useState([]); // Store selected song IDs
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); // Initialize navigation hook

  // Fetch only unassigned songs from the backend when the component mounts
  useEffect(() => {
    const fetchUnassignedSongs = async () => {
      try {
        const response = await fetch("/api/albums/songs/unassigned"); // New route
        const data = await response.json();
        if (response.ok) {
          setAvailableSongs(data);
        } else {
          setMessage("Failed to fetch unassigned songs.");
        }
      } catch (error) {
        console.error("Error fetching unassigned songs:", error);
        setMessage("Error fetching unassigned songs.");
      }
    };

    fetchUnassignedSongs();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      title,
      image_url: imageUrl, // Use the image URL instead of file upload
      song_ids: selectedSongs, // Send selected song IDs as an array
    };

    try {
      const response = await fetch("/api/albums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Send JSON instead of FormData
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.error || "Something went wrong"}`);
      } else {
        setMessage("Album created successfully!");
        setTitle("");
        setImageUrl(""); // Reset the image URL field
        setSelectedSongs([]); // Reset song selections
        setNumSongs(1);

        // Redirect to /albums after successful album creation
        navigate("/albums");
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

        {/* URL input for album cover */}
        <label>
          Album Cover URL:
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter image URL"
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
                  {song.title}
                </option>
              ))}
            </select>
          </label>
        ))}

        <button type="submit">Create Album</button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default CreateAlbum;
