
const FETCH_SONGS_START = "songs/FETCH_SONGS_START";
const FETCH_SONGS_SUCCESS = "songs/FETCH_SONGS_SUCCESS";
const FETCH_SONGS_FAILURE = "songs/FETCH_SONGS_FAILURE";


const fetchSongsStart = () => ({ type: FETCH_SONGS_START });
const fetchSongsSuccess = (songs) => ({ type: FETCH_SONGS_SUCCESS, payload: songs });
const fetchSongsFailure = (error) => ({ type: FETCH_SONGS_FAILURE, payload: error });


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
    default:
      return state;
  }
}
