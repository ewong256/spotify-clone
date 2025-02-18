import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkFetchPlaylist, thunkRenamePlaylist, thunkAddSong, thunkRemoveSong, thunkFetchAllPlaylists } from "../../redux/playlistReducer";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const Playlist = () => {
  const { playlistId } = useParams();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.session.user);

  // State for managing playlist and available songs
  const [newTitle, setNewTitle] = useState("");
  const [songId, setSongId] = useState("");
  const [error, setError] = useState("");
  const [showAvailableSongs, setShowAvailableSongs] = useState(false); // New state for showing available songs
  const playlists = useSelector((state) => state.playlists);
  const playlist = playlists[playlistId];
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(thunkFetchAllPlaylists());  // Fetch all playlists
    }
  }, [dispatch, currentUser]);

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

  const isPlaylistPage = location.pathname.includes(`/playlists/${playlistId}`);
  const isOwner = playlist && currentUser?.id === playlist.user_id;

  return (
    <div>
      {/* Render links to playlists only if we're on the /playlists page */}
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

          {/* Show only current user's playlists */}
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
                      {playlist.available_songs?.map((song) => (
                        <li key={song.id}>
                          {song.title} - {song.artist}
                          <button onClick={() => addSong(song.id)}>Add</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          {error && <p style={{ color: "red" }}>{error}</p>}

          <ul>
            {playlist.songs?.map((song) => (
              <li key={song.id}>
                {song.title} - {song.artist}
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
