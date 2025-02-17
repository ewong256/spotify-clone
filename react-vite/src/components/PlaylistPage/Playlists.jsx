import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkFetchPlaylist, thunkFetchAllPlaylists } from "../../redux/playlistReducer";
import { useParams } from "react-router-dom";

const Playlist = () => {
  const { playlistId } = useParams();
  const dispatch = useDispatch();
  
  // Select playlists data from the Redux store
  const allPlaylists = useSelector((state) => state.playlists);
  const playlist = allPlaylists[playlistId];

  useEffect(() => {
    if (playlistId) {
      dispatch(thunkFetchPlaylist(playlistId)); // Fetch specific playlist when playlistId is available
    } else {
      dispatch(thunkFetchAllPlaylists()); // Fetch all playlists if no playlistId
    }
  }, [dispatch, playlistId]); // Effect runs only when playlistId changes

  if (!playlistId) {
    // Render all playlists if on the /playlists route
    return (
      <div>
        <h2>Your Playlists</h2>
        <ul>
          {Object.values(allPlaylists).map((pl) => (
            <li key={pl.id}>
              <a href={`/playlists/${pl.id}`}>{pl.title}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (playlist) {
    // Render individual playlist if on the /playlists/:id route
    return (
      <div>
        <h2>{playlist.title}</h2>
        <p>Number of songs: {playlist.songs.length}</p>
        {/* Add more playlist details, rename, add/remove songs */}
      </div>
    );
  }

  return <p>Loading...</p>;
};

export default Playlist;
