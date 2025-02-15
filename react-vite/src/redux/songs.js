const FETCH_SONGS_START = "songs/FETCH_SONGS_START";
const FETCH_SONGS_SUCCESS = "songs/FETCH_SONGS_SUCCESS";
const FETCH_SONGS_FAILURE = "songs/FETCH_SONGS_FAILURE";

const ADD_SONG_SUCCESS = "songs/ADD_SONG_SUCCESS";
const EDIT_SONG_SUCCESS = "songs/EDIT_SONG_SUCCESS";
const DELETE_SONG_SUCCESS = "songs/DELETE_SONG_SUCCESS";


const fetchSongsStart = () => ({ type: FETCH_SONGS_START });
const fetchSongsSuccess = (songs) => ({ type: FETCH_SONGS_SUCCESS, payload: songs });
const fetchSongsFailure = (error) => ({ type: FETCH_SONGS_FAILURE, payload: error });

const addSongSuccess = (song) => ({ type: ADD_SONG_SUCCESS, payload: song });
const editSongSuccess = (song) => ({ type: EDIT_SONG_SUCCESS, payload: song });
const deleteSongSuccess = (songId) => ({ type: DELETE_SONG_SUCCESS, payload: songId });


export const fetchSongs = () => async (dispatch) => {
  dispatch(fetchSongsStart());
  try {
    const response = await fetch("/api/songs");
    const data = await response.json();
    dispatch(fetchSongsSuccess(data.songs));
  } catch (error) {
    dispatch(fetchSongsFailure(error.message));
  }
};

// **Thunk to Add a Song**
export const addSong = (songData) => async (dispatch) => {
  try {
    const response = await fetch("/api/songs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(songData),
    });

    if (!response.ok) {
      throw new Error("Failed to add song");
    }

    const data = await response.json();
    dispatch(addSongSuccess(data.song));
  } catch (error) {
    console.error(error);
  }
};

// **Thunk to Edit a Song**
export const editSong = (songId, updatedData) => async (dispatch) => {
  try {
    const response = await fetch(`/api/songs/${songId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error("Failed to edit song");
    }

    const data = await response.json();
    dispatch(editSongSuccess(data));
  } catch (error) {
    console.error(error);
  }
};

// **Thunk to Delete a Song**
export const deleteSong = (songId) => async (dispatch) => {
  try {
    const response = await fetch(`/api/songs/${songId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete song");
    }

    dispatch(deleteSongSuccess(songId));
  } catch (error) {
    console.error(error);
  }
};

// **Initial State**
const initialState = {
  songs: [],
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

// **Reducer**
export default function songsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_SONGS_START:
      return { ...state, status: "loading" };
    case FETCH_SONGS_SUCCESS:
      return { ...state, status: "succeeded", songs: action.payload };
    case FETCH_SONGS_FAILURE:
      return { ...state, status: "failed", error: action.payload };

    case ADD_SONG_SUCCESS:
      return { ...state, songs: [...state.songs, action.payload] };

    case EDIT_SONG_SUCCESS:
      return {
        ...state,
        songs: state.songs.map((song) =>
          song.id === action.payload.id ? action.payload : song
        ),
      };

    case DELETE_SONG_SUCCESS:
      return {
        ...state,
        songs: state.songs.filter((song) => song.id !== action.payload),
      };

    default:
      return state;
  }
}
