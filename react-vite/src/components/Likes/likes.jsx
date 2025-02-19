import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLikes, likeSongs, unlikeSongs } from "../../redux/likes";

const LikeButton = ({ song }) => {
    const dispatch = useDispatch();
    const currUserId = useSelector((state) => state.session.user?.id);

    useEffect(() => {
        if (song?.id) {
            dispatch(fetchLikes(song.id));
        }
    }, [dispatch, song?.id]);

    const likesForSong = useSelector((state) => state.likes[song.id] || []);
    const currUserLikes = likesForSong.find((data) => data.user_id === currUserId);
    const likeCount = likesForSong.length;

    function handleLike() {
        if (currUserLikes) {
            dispatch(unlikeSongs(song.id, currUserId));
        } else {
            dispatch(likeSongs(song.id, currUserId));
        }
    }

    return (
        <button onClick={handleLike}>
            {currUserLikes ? "Unlike" : "Like"} {likeCount} Likes
        </button>
    );
};

export default LikeButton;
