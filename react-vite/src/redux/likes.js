// Action Types
const LOAD_LIKES = "likes/loadLikes"
const LIKE_SONG = "likes/likeSong"
const UNLIKE_SONG = "likes/unlikeSong"

// Actions Creators
const loadLikes = (songId, likes, users) => ({
    type: LOAD_LIKES,
    songId,
    likes,
    users
});

const likeSong = (payload) => {
    return {
        type: LIKE_SONG,
        payload: { song_id: payload.song_id, user_id: payload.user, id: payload.new_like_id }
    }
}

const unlikeSong = (songId, userId) => ({
    type: UNLIKE_SONG,
    songId,
    userId
});

// Thunks
export const fetchLikes = (songId) => async (dispatch) => {
    const res = await fetch(`/api/songs/${songId}/likes`);
    if (res.ok) {
        const data = await res.json();
        dispatch(loadLikes(songId, data.users.length, data.users))
    }
};

export const likeSongs = (songId, userId) => async (dispatch) => {
    const res = await fetch(`/api/songs/${songId}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
    });
    if (res.ok) {
        let resBody = await res.json()
        dispatch(likeSong(resBody))
    }
};

export const unlikeSongs = (songId, userId) => async (dispatch) => {
    const res = await fetch(`/api/songs/${songId}/likes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
    });
    if (res.ok) {
        dispatch(unlikeSong(songId, userId))
    }
};


export default function likesReducer(state = {}, action) {
    switch(action.type) {
        case "songs/FETCH_SONGS_SUCCESS":
            let likeArr = action.payload.reduce((acc, song) => {
                acc[song.id] = song.likes;
                return acc;
            }, {});
            return { ...state, ...likeArr };
        case LIKE_SONG:
                const updatedLikes = [...(state[action.payload.song_id] || []), action.payload];
                return { ...state, [action.payload.song_id]: updatedLikes };
        case UNLIKE_SONG:
                return { ...state, [action.songId]: state[action.songId].filter(like => like.user_id !== action.userId)};
        default:
                return state;
    }
}
