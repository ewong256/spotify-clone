import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkFetchPlaylist, thunkRenamePlaylist, thunkAddSong, thunkRemoveSong, thunkFetchAllPlaylists } from "../../redux/playlistReducer";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const Playlist = () => {
  const { playlistId } = useParams(); // Get ID from URL
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.session.user);

  // State
  const [newTitle, setNewTitle] = useState("");
  const [songId, setSongId] = useState("");
  const [error, setError] = useState("");
  const playlists = useSelector((state) => state.playlists); // Get all playlists from Redux store
  const playlist = playlists[playlistId]; // Get specific playlist from Redux store

  // Get current URL location
  const location = useLocation();
  const navigate = useNavigate(); // For navigating back to the playlists page

  // Fetch all playlists on component mount (when user is logged in)
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(thunkFetchAllPlaylists());
    }
  }, [dispatch, currentUser]);

  // Handle renaming the playlist
  const renamePlaylist = async () => {
    const success = await dispatch(thunkRenamePlaylist(playlistId, newTitle));
    if (!success) setError("Failed to update playlist title.");
    else setNewTitle("");
  };

  // Handle adding a song
  const addSong = async () => {
    const success = await dispatch(thunkAddSong(playlistId, songId));
    if (!success) setError("Failed to add song.");
    else setSongId("");
  };

  // Handle removing a song
  const removeSong = async (songId) => {
    const success = await dispatch(thunkRemoveSong(playlistId, songId));
    if (!success) setError("Failed to remove song.");
  };

  // Filter playlists for the logged-in user
  const myPlaylists = Object.values(playlists).filter(
    (pl) => pl.user_id === currentUser?.id
  );

  // Check if the current page is a playlist page (i.e. not the index)
  const isPlaylistPage = location.pathname.includes(`/playlists/${playlistId}`);

  // Check if the current user is the owner of the playlist
  const isOwner = playlist && currentUser?.id === playlist.user_id;

  return (
    <div>
      {/* Only show the following if we're not on a specific playlist page */}
      {!isPlaylistPage && (
        <>
          {/* Display all playlists if the user is logged in */}
          <h2>All Playlists</h2>
          <ul>
            {Object.values(playlists).map((pl) => (
              <li key={pl.id}>
                <a href={`/playlists/${pl.id}`}>{pl.title}</a>
              </li>
            ))}
          </ul>

          {/* Display My Playlists (only user-owned playlists) */}
          <h2>My Playlists</h2>
          <ul>
            {myPlaylists.length === 0 ? (
              <p>No playlists available.</p>
            ) : (
              myPlaylists.map((pl) => (
                <li key={pl.id}>
                  <a href={`/playlists/${pl.id}`}>{pl.title}</a>
                </li>
              ))
            )}
          </ul>
        </>
      )}

      {/* Display the selected playlist's details */}
      {playlist && (
        <>
          <h3>{playlist.title}</h3>

          {/* Button to go back to the playlists page */}
          <button onClick={() => navigate("/playlists")}>
            Back to Playlists
          </button>

          {/* Only show the following buttons if the current user is the owner */}
          {isOwner && (
            <>
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
            </>
          )}

          {/* Error Handling */}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {/* Playlist Songs */}
          <ul>
            {playlist.songs?.map((song) => (
              <li key={song.id}>
                {song.title}
                {/* Only show the "Remove" button if the user is the owner */}
                {isOwner && (
                  <button onClick={() => removeSong(song.id)}>Remove</button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Playlist;
