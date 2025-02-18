const LOAD_PLAYLIST = "playlists/loadPlaylist";
const REMOVE_SONG = "playlists/removeSong";
const ADD_SONG = "playlists/addSong";
const UPDATE_PLAYLIST = "playlists/updatePlaylist";
const LOAD_PLAYLISTS = "playlists/loadPlaylists";

const loadPlaylist = (playlist) => ({
  type: LOAD_PLAYLIST,
  playlist,
});

const loadPlaylists = (playlists) => ({
  type: LOAD_PLAYLISTS,
  playlists,
});

const removeSongFromPlaylist = (playlistId, songId) => ({
  type: REMOVE_SONG,
  playlistId,
  songId,
});

const addSongToPlaylist = (playlist) => ({
  type: ADD_SONG,
  playlist,
});

const updatePlaylist = (playlistId, title) => ({
  type: UPDATE_PLAYLIST,
  playlistId,
  title,
});

// Fetch a single playlist
export const thunkFetchPlaylist = (playlistId) => async (dispatch) => {
  const response = await fetch(`/api/playlists/${playlistId}`);
  if (response.ok) {
    const playlist = await response.json();
    dispatch(loadPlaylist(playlist));
  }
};

// Fetch all playlists
export const thunkFetchAllPlaylists = () => async (dispatch) => {
  const res = await fetch("/api/playlists");
  if (res.ok) {
    const playlists = await res.json();
    dispatch(loadPlaylists(playlists));
  }
};

// Rename a playlist
export const thunkRenamePlaylist = (playlistId, title) => async (dispatch) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/playlists/${playlistId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });

  if (response.ok) {
    dispatch(updatePlaylist(playlistId, title));
    return true;
  }
  return false;
};

// Add a song to a playlist and update the Redux store
export const thunkAddSong = (playlistId, songId) => async (dispatch) => {
  const response = await fetch(`/api/playlists/${playlistId}/songs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ song_id: songId }),
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(addSongToPlaylist(data.playlist)); // Update the entire playlist in Redux
    return true;
  } else {
    const errorData = await response.json();
    alert(errorData.error || "Failed to add song.");
    return false;
  }
};

// Remove a song from a playlist
export const thunkRemoveSong = (playlistId, songId) => async (dispatch) => {
  const response = await fetch(`/api/playlists/${playlistId}/songs/${songId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    dispatch(removeSongFromPlaylist(playlistId, songId));
    return true;
  }
  return false;
};

const playlistReducer = (state = {}, action) => {
  switch (action.type) {
    case LOAD_PLAYLIST:
      return {
        ...state,
        [action.playlist.id]: {
          ...action.playlist,
          songs: action.playlist.songs || [],
        },
      };

    case UPDATE_PLAYLIST:
      return {
        ...state,
        [action.playlistId]: {
          ...state[action.playlistId],
          title: action.title,
        },
      };

    case LOAD_PLAYLISTS: {
      const newPlaylists = { ...state };
      action.playlists.forEach((pl) => {
        newPlaylists[pl.id] = { ...pl, songs: pl.songs || [] };
      });
      return newPlaylists;
    }

    case ADD_SONG:
      return {
        ...state,
        [action.playlist.id]: {
          ...action.playlist,
          songs: action.playlist.songs || [],
        },
      };

    case REMOVE_SONG:
      return {
        ...state,
        [action.playlistId]: {
          ...state[action.playlistId],
          songs: state[action.playlistId].songs.filter(
            (song) => song.id !== action.songId
          ),
        },
      };

    default:
      return state;
  }
};

export default playlistReducer;
