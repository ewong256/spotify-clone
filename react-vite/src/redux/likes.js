// Action Types
const LOAD_LIKES = "likes/loadLikes"
const LIKE_SONG = "likes/likeSong"
const UNLIKE_SONG = "likes/unlikeSong"

// Actions Creators
const loadLikes = (songId, likes) => ({
    type: LOAD_LIKES,
    songId,
    likes
});

const likeSong = (songId) => ({
    type: LIKE_SONG,
    songId
});

const unlikeSong = (songId) => ({
    type: UNLIKE_SONG,
    songId
});

// Thunks
export const fetchLikes = (songId) => async (dispatch) => {
    const res = await fetch(`/api/song/${songId}/likes`);
    if (res.ok) {
        const data = await response.json();
        dispatch(loadLikes(songId, data.likes))
    }
};

export const likeSongs = (songId) => async (dispatch) => {
    const res = await fetch(`/api/songs/${songId}/likes`, {method: "POST"});
    if (res.ok) {
        dispatch(likeSong(songId));
    }
};

export const unlikeSongs = (songId) => async (dispatch) => {
    const res = await fetch(`/api/songs/${songId}/likes`, {method: "POST"});
    if (res.ok) {
        dispatch(unlikeSong(songId))
    }
};


// Reducer
export default function likesReducer(state = {}, action) {
    switch(action.type) {
        case LOAD_LIKES:
            return { ...state, [action.songId]: action.likes};
            case LIKE_SONG:
                return { ...state, [action.songId]: (state[action.songId] || 0) + 1 };
              case UNLIKE_SONG:
                return { ...state, [action.songId]: Math.max((state[action.songId] || 1) - 1, 0) };
              default:
                return state;
    }
};
