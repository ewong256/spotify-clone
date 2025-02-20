// Constants
const LOAD_PLAYLIST = "playlists/loadPlaylist";
const LOAD_PLAYLISTS = "playlists/loadPlaylists";
const CREATE_PLAYLIST = "playlists/createPlaylist";
const UPDATE_PLAYLIST = "playlists/updatePlaylist";
const DELETE_PLAYLIST = "playlists/deletePlaylist";
const ADD_SONG = "playlists/addSong";
const REMOVE_SONG = "playlists/removeSong";

// Action Creators
const loadPlaylist = (playlist) => ({
  type: LOAD_PLAYLIST,
  playlist,
});

const loadPlaylists = (playlists) => ({
  type: LOAD_PLAYLISTS,
  playlists,
});

const createPlaylistAction = (playlist) => ({
  type: CREATE_PLAYLIST,
  playlist,
});

const updatePlaylist = (playlistId, title) => ({
  type: UPDATE_PLAYLIST,
  playlistId,
  title,
});

const deletePlaylist = (playlistId) => ({
  type: DELETE_PLAYLIST,
  playlistId,
});

const addSongToPlaylist = (playlist) => ({
  type: ADD_SONG,
  playlist,
});

const removeSongFromPlaylist = (playlistId, songId) => ({
  type: REMOVE_SONG,
  playlistId,
  songId,
});

// Thunks

// Fetch a single playlist
export const thunkFetchPlaylist = (playlistId) => async (dispatch) => {
  const response = await fetch(`/api/playlists/${playlistId}`, {
    credentials: "include",
  });

  if (response.ok) {
    const playlist = await response.json();
    if (playlist?.id) dispatch(loadPlaylist(playlist));
  }
};

// Fetch all playlists
export const thunkFetchAllPlaylists = () => async (dispatch) => {
  const response = await fetch("/api/playlists", {
    credentials: "include",
  });

  if (response.ok) {
    const playlistsArray = await response.json();

    if (Array.isArray(playlistsArray)) {
      const playlists = {};
      playlistsArray.forEach((playlist) => {
        playlists[playlist.id] = { ...playlist, songs: playlist.songs || [] };
      });
      dispatch(loadPlaylists(playlists));
    }
  }
};

// Create a playlist
export const thunkCreatePlaylist = (title, imageUrl) => async (dispatch) => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/playlists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ title, image_url: imageUrl }),
    credentials: "include",
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(createPlaylistAction(data));

    // Fetch all playlists again to ensure UI updates
    dispatch(thunkFetchAllPlaylists());

    return data;
  }
  return null;
};

// Rename a playlist
export const thunkRenamePlaylist = (playlistId, title) => async (dispatch) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/playlists/${playlistId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
    credentials: "include",
  });

  if (response.ok) {
    dispatch(updatePlaylist(playlistId, title));
    return true;
  }
  return false;
};

// Delete a playlist
export const thunkDeletePlaylist = (playlistId) => async (dispatch) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/playlists/${playlistId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (response.ok) {
    dispatch(deletePlaylist(playlistId));
    return true;
  }
  return false;
};

// Add a song to a playlist
export const thunkAddSong = (playlistId, songId) => async (dispatch) => {
  const token = localStorage.getItem("token");
  const csrfToken = document.cookie.match(/csrf_token=([^;]+)/)?.[1];
  const response = await fetch(`/api/playlists/${playlistId}/songs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "X-CSRFToken": csrfToken || "",
    },
    credentials: "include",
    body: JSON.stringify({ song_id: songId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.log("Error adding song:", errorData);
    return false;
  }

  const data = await response.json();
  dispatch(addSongToPlaylist(data));
  return true;
};

// Remove a song from a playlist
export const thunkRemoveSong = (playlistId, songId) => async (dispatch) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/playlists/${playlistId}/songs/${songId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (response.ok) {
    dispatch(removeSongFromPlaylist(playlistId, songId));
    return true;
  }
  return false;
};

// Reducer
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

    case LOAD_PLAYLISTS:
      return { ...action.playlists };

    case CREATE_PLAYLIST:
      if (!action.playlist?.id) return state;
      return {
        ...state,
        [action.playlist.id]: {
          ...action.playlist,
          songs: action.playlist.songs || [],
        },
      };

    case UPDATE_PLAYLIST:
      if (!state[action.playlistId]) return state;
      return {
        ...state,
        [action.playlistId]: {
          ...state[action.playlistId],
          title: action.title,
        },
      };

    case DELETE_PLAYLIST: {
      const newState = { ...state };
      delete newState[action.playlistId];
      return newState;
    }

    case ADD_SONG:
      if (!action.playlist?.id) return state;
      return {
        ...state,
        [action.playlist.id]: {
          ...action.playlist,
          songs: action.playlist.songs || [],
        },
      };

    case REMOVE_SONG:
      if (!state[action.playlistId]) return state;
      return {
        ...state,
        [action.playlistId]: {
          ...state[action.playlistId],
          songs: state[action.playlistId].songs.filter((song) => song.id !== action.songId),
        },
      };

    default:
      return state;
  }
};

export default playlistReducer;