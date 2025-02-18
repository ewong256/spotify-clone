const FETCH_SONGS_START = "songs/FETCH_SONGS_START";
const FETCH_SONGS_SUCCESS = "songs/FETCH_SONGS_SUCCESS";
const FETCH_SONGS_FAILURE = "songs/FETCH_SONGS_FAILURE";

const CREATE_SONG_START = "songs/CREATE_SONG_START";
const CREATE_SONG_SUCCESS = "songs/CREATE_SONG_SUCCESS";
const CREATE_SONG_FAILURE = "songs/CREATE_SONG_FAILURE";

const UPDATE_SONG_START = "songs/UPDATE_SONG_START";
const UPDATE_SONG_SUCCESS = "songs/UPDATE_SONG_SUCCESS";
const UPDATE_SONG_FAILURE = "songs/UPDATE_SONG_FAILURE";

// Action Creators
const fetchSongsStart = () => ({ type: FETCH_SONGS_START });
const fetchSongsSuccess = (songs) => ({ type: FETCH_SONGS_SUCCESS, payload: songs });
const fetchSongsFailure = (error) => ({ type: FETCH_SONGS_FAILURE, payload: error });

const createSongStart = () => ({ type: CREATE_SONG_START });
const createSongSuccess = (song) => ({ type: CREATE_SONG_SUCCESS, payload: song });
const createSongFailure = (error) => ({ type: CREATE_SONG_FAILURE, payload: error });

const updateSongStart = () => ({ type: UPDATE_SONG_START });
const updateSongSuccess = (song) => ({ type: UPDATE_SONG_SUCCESS, payload: song });
const updateSongFailure = (error) => ({ type: UPDATE_SONG_FAILURE, payload: error });

// Thunks
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

export const createSong = (formData) => async (dispatch) => {
  dispatch(createSongStart());
  try {
    const response = await fetch("/api/songs", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    dispatch(createSongSuccess(data.song));
  } catch (error) {
    dispatch(createSongFailure(error.message));
  }
};

export const updateSong = (songId, formData) => async (dispatch) => {
  dispatch(updateSongStart());
  try {
    const response = await fetch(`/api/songs/${songId}`, {
      method: "PUT",
      body: formData,
    });
    const data = await response.json();
    dispatch(updateSongSuccess(data.song));
  } catch (error) {
    dispatch(updateSongFailure(error.message));
  }
};

// Initial State
const initialState = {
  songs: [],
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

// Reducer
export default function songsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_SONGS_START:
      return { ...state, status: "loading" };
    case FETCH_SONGS_SUCCESS:
      return { ...state, status: "succeeded", songs: action.payload };
    case FETCH_SONGS_FAILURE:
      return { ...state, status: "failed", error: action.payload };

    case CREATE_SONG_START:
      return { ...state, status: "loading" };
    case CREATE_SONG_SUCCESS:
      return {
        ...state,
        status: "succeeded",
        songs: [...state.songs, action.payload],
      };
    case CREATE_SONG_FAILURE:
      return { ...state, status: "failed", error: action.payload };

    case UPDATE_SONG_START:
      return { ...state, status: "loading" };
    case UPDATE_SONG_SUCCESS:
      return {
        ...state,
        status: "succeeded",
        songs: state.songs.map((song) =>
          song.id === action.payload.id ? action.payload : song
        ),
      };
    case UPDATE_SONG_FAILURE:
      return { ...state, status: "failed", error: action.payload };

    default:
      return state;
  }
}