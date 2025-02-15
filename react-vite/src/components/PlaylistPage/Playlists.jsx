import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkFetchPlaylist, thunkRenamePlaylist, thunkAddSong, thunkRemoveSong, thunkFetchAllPlaylists } from "../../redux/playlistReducer";
import { useParams } from "react-router-dom";



const Playlist = () => {
  const { playlistId } = useParams(); // Get ID from URL
  console.log("Playlist ID:", playlistId); // Debugging

  const dispatch = useDispatch();
  const playlist = useSelector((state) => state.playlists); // Get playlist from Redux
  const [newTitle, setNewTitle] = useState("");
  const [songId, setSongId] = useState("");
  const [error, setError] = useState("");

  // Fetch playlist details when component mounts
  // useEffect(() => {
  //   dispatch(thunkFetchPlaylist(playlistId));
  // }, [dispatch, playlistId]);

  useEffect(() => {
    if (playlistId) {
      dispatch(thunkFetchPlaylist(playlistId));
    } else {
      dispatch(thunkFetchAllPlaylists());
    }
  }, [dispatch, playlistId]);

  // Handle renaming the playlist
  const renamePlaylist = async () => {
    const success = await dispatch(thunkRenamePlaylist(playlistId, newTitle));
    if (!success) setError("Failed to update playlist title.");
  };

  // Handle adding a song
  const addSong = async () => {
    const success = await dispatch(thunkAddSong(playlistId, songId));
    if (!success) setError("Failed to add song.");
  };

  // Handle removing a song
  const removeSong = async (songId) => {
    const success = await dispatch(thunkRemoveSong(playlistId, songId));
    if (!success) setError("Failed to remove song.");
  };

  // if (!playlist) return <p>Loading playlist...</p>;


  return (
    <div>
        <h2>All Playlists</h2>
        <ul>
          {Object.values(playlist).map((pl) => (
            <li key={pl.id}>
              <a href={`/playlists/${pl.id}`}>{pl.title}</a>
            </li>
          ))}
        </ul>
      </div>
    );


};

export default Playlist;
