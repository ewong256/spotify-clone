
const FETCH_SONGS_START = "songs/FETCH_SONGS_START";
const FETCH_SONGS_SUCCESS = "songs/FETCH_SONGS_SUCCESS";
const FETCH_SONGS_FAILURE = "songs/FETCH_SONGS_FAILURE";

const CREATE_SONG_START = "songs/CREATE_SONG_START";
const CREATE_SONG_SUCCESS = "songs/CREATE_SONG_SUCCESS";
const CREATE_SONG_FAILURE = "songs/CREATE_SONG_FAILURE";


const fetchSongsStart = () => ({ type: FETCH_SONGS_START });
const fetchSongsSuccess = (songs) => ({ type: FETCH_SONGS_SUCCESS, payload: songs });
const fetchSongsFailure = (error) => ({ type: FETCH_SONGS_FAILURE, payload: error });

const createSongStart = () => ({ type: CREATE_SONG_START });
const createSongSuccess = (song) => ({ type: CREATE_SONG_SUCCESS, payload: song });
const createSongFailure = (error) => ({ type: CREATE_SONG_FAILURE, payload: error });


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


const initialState = {
  songs: [],
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};


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
        songs: [...state.songs, action.payload], // Add newly created song to the list
      };
    case CREATE_SONG_FAILURE:
      return { ...state, status: "failed", error: action.payload };
    default:
      return state;
  }
}
