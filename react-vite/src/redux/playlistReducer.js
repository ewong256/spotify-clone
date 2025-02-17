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

export const thunkFetchPlaylist = (playlistId) => async (dispatch) => {
  const response = await fetch(`/api/playlists/${playlistId}`);
  if (response.ok) {
    const playlist = await response.json();
    dispatch(loadPlaylist(playlist));
  }
};

export const thunkFetchAllPlaylists = () => async (dispatch) => {
  const res = await fetch("/api/playlists");
  if (res.ok) {
    const playlists = await res.json();
    dispatch(loadPlaylists(playlists));
  }
};

const playlistReducer = (state = {}, action) => {
  switch (action.type) {
    case LOAD_PLAYLIST:
      return { ...state, [action.playlist.id]: action.playlist };
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
        newPlaylists[pl.id] = pl;
      });
      return newPlaylists;
    }
    case ADD_SONG:
      return {
        ...state,
        [action.playlistId]: {
          ...state[action.playlistId],
          songs: [...state[action.playlistId].songs, action.song],
        },
      };
    case REMOVE_SONG:
      return {
        ...state,
        [action.playlistId]: {
          ...state[action.playlistId],
          songs: state[action.playlistId].songs.filter((s) => s.id !== action.songId),
        },
      };
    default:
      return state;
  }
};

export default playlistReducer;
