import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  thunkFetchPlaylist, 
  thunkRenamePlaylist, 
  thunkAddSong, 
  thunkRemoveSong, 
  thunkFetchAllPlaylists, 
  thunkCreatePlaylist, 
  thunkDeletePlaylist 
} from "../../redux/playlistReducer";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const Playlist = () => {
  const { playlistId } = useParams();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.session.user);
  const navigate = useNavigate();

  // State for managing playlist, songs, and errors
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState("");
  const [showAvailableSongs, setShowAvailableSongs] = useState(false);
  const [availableSongs, setAvailableSongs] = useState([]); // State for all available songs
  const [newPlaylistTitle, setNewPlaylistTitle] = useState(""); // State for creating a new playlist

  const playlists = useSelector((state) => state.playlists);
  const playlist = playlists[playlistId];
  const location = useLocation();

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(thunkFetchAllPlaylists());
    }
  }, [dispatch, currentUser]);

  // Fetch all available songs when "Add Songs" is clicked
  useEffect(() => {
    if (showAvailableSongs) {
      fetch("/api/songs")
        .then((res) => res.json())
        .then((data) => setAvailableSongs(data.songs || []))
        .catch(() => setError("Failed to fetch available songs."));
    }
  }, [showAvailableSongs]);

  const renamePlaylist = async () => {
    const success = await dispatch(thunkRenamePlaylist(playlistId, newTitle));
    if (!success) setError("Failed to update playlist title.");
    else setNewTitle("");
  };

  const addSong = async (songId) => {
    const success = await dispatch(thunkAddSong(playlistId, songId));
    if (!success) setError("Failed to add song.");
  };

  const removeSong = async (songId) => {
    const success = await dispatch(thunkRemoveSong(playlistId, songId));
    if (!success) setError("Failed to remove song.");
  };

  const createPlaylist = async () => {
    if (!newPlaylistTitle) {
        setError("Please enter a title for the playlist.");
        return;
    }

    const newPlaylist = await dispatch(thunkCreatePlaylist(newPlaylistTitle));

    if (!newPlaylist) {
        setError("Failed to create playlist.");
    } else {
        setNewPlaylistTitle(""); // Clear input
        navigate(`/playlists/${newPlaylist.id}`);
    }
  };

  const deletePlaylist = async () => {
    const success = await dispatch(thunkDeletePlaylist(playlistId));
    if (!success) setError("Failed to delete playlist.");
    else navigate("/playlists"); // Navigate back to the playlists list after deleting
  };

  const isOwner = playlist && currentUser?.id === playlist.user_id;

  return (
    <div>
      {location.pathname === "/playlists" && (
        <>
          <h2>All Playlists</h2>
          <ul>
            {Object.values(playlists).map((pl) => (
              <li key={pl.id}>
                <a href={`/playlists/${pl.id}`}>{pl.title}</a>
              </li>
            ))}
          </ul>

          {currentUser && (
            <>
              <h2>My Playlists</h2>
              <ul>
                {Object.values(playlists)
                  .filter((pl) => pl.user_id === currentUser.id)
                  .map((pl) => (
                    <li key={pl.id}>
                      <a href={`/playlists/${pl.id}`}>{pl.title}</a>
                    </li>
                  ))}
              </ul>
              <div>
                <h3>Create New Playlist</h3>
                <input
                  type="text"
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  placeholder="Enter playlist title"
                />
                <button onClick={createPlaylist}>Create Playlist</button>
              </div>
            </>
          )}
        </>
      )}

      {playlist && (
        <>
          <h3>{playlist.title}</h3>
          <button onClick={() => navigate("/playlists")}>Back to Playlists</button>

          {isOwner && (
            <>
              <div>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="New Playlist Title"
                />
                <button onClick={renamePlaylist}>Rename Playlist</button>
              </div>

              <div>
                <button onClick={() => setShowAvailableSongs(!showAvailableSongs)}>
                  {showAvailableSongs ? "Hide Available Songs" : "Add Songs"}
                </button>

                {showAvailableSongs && (
                  <div>
                    <h4>Available Songs</h4>
                    <ul>
                      {availableSongs.length > 0 ? (
                        availableSongs.map((song) => (
                          <li key={song.id}>
                            {song.title} - {song.artist}
                            <button onClick={() => addSong(song.id)}>Add</button>
                          </li>
                        ))
                      ) : (
                        <p>No songs available.</p>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <button onClick={deletePlaylist}>Delete Playlist</button>
              </div>
            </>
          )}

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div>
            <h4>Songs in this Playlist</h4>
            <ul>
              {playlist.songs?.length > 0 ? (
                playlist.songs.map((song) => (
                  <li key={song.id}>
                    {song.title} - {song.artist}
                    {isOwner && <button onClick={() => removeSong(song.id)}>Remove</button>}
                  </li>
                ))
              ) : (
                <p>No songs in this playlist.</p>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Playlist;
