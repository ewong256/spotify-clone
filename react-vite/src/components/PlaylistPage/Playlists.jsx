import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkFetchPlaylist, thunkRenamePlaylist, thunkAddSong, thunkRemoveSong, thunkFetchAllPlaylists } from "../../redux/playlistReducer";
import { useParams } from "react-router-dom";

const Playlist = () => {
  console.log("part 1");
  const { playlistId } = useParams(); // Get ID from URL
  console.log("Playlist ID:", playlistId); // Debugging

  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.session);
  console.log("part 2");

  // If the user is not logged in, redirect to login page (you can implement this redirect if needed)

  const playlist = useSelector((state) => state.playlists[playlistId]); // Get the specific playlist from Redux
  const [newTitle, setNewTitle] = useState(""); // State for renaming the playlist
  const [songId, setSongId] = useState(""); // State for adding a song
  const [error, setError] = useState(""); // State for error handling
  console.log("part 3");

  // Fetch playlist details when component mounts
  useEffect(() => {
    if (playlistId) {
      dispatch(thunkFetchPlaylist(playlistId)); // Dispatch to fetch playlist by ID
    } else {
      console.log('this is where the infinite loop was');
      // dispatch(thunkFetchAllPlaylist(playlistId));
    }
  }, [dispatch, playlistId]);

  // Handle renaming the playlist
  const renamePlaylist = async () => {
    const success = await dispatch(thunkRenamePlaylist(playlistId, newTitle));
    if (!success) setError("Failed to update playlist title.");
    else setNewTitle(""); // Clear input field after successful rename
  };

  // Handle adding a song
  const addSong = async () => {
    const success = await dispatch(thunkAddSong(playlistId, songId));
    if (!success) setError("Failed to add song.");
    else setSongId(""); // Clear input field after adding song
  };

  // Handle removing a song
  const removeSong = async (songId) => {
    const success = await dispatch(thunkRemoveSong(playlistId, songId));
    if (!success) setError("Failed to remove song.");
  };

  return (
    <div>
      <h2>{playlist?.title}</h2> {/* Display playlist title */}

      {/* Rename Playlist */}
      <div>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New Playlist Title"
        />
        <button onClick={renamePlaylist}>Rename Playlist</button>
      </div>

      {/* Error Handling */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Add Song */}
      <div>
        <input
          type="text"
          value={songId}
          onChange={(e) => setSongId(e.target.value)}
          placeholder="Song ID to Add"
        />
        <button onClick={addSong}>Add Song</button>
      </div>

      {/* Playlist Songs */}
      <ul>
        {playlist?.songs?.map((song) => (
          <li key={song.id}>
            {song.title}
            <button onClick={() => removeSong(song.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Playlist;
