import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLikes, likeSongs, unlikeSongs } from "../../redux/likes";

const LikeButton = ({ songId, userId }) => {
    const dispatch = useDispatch();
    const likes = useSelector((state) => state.likes[songId] || 0);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        dispatch(fetchLikes(songId));
    }, [dispatch, songId, userId]);

    const handleLike = async () => {
        if (liked) {
            await dispatch(unlikeSongs(songId, userId));
        } else {
            await dispatch(likeSongs(songId, userId));
        }
        setLiked(!liked);
    };

    return (
        <button onClick={handleLike} className={`like-button ${liked ? "liked" : ""}`}>
            {liked ? "Unlike" : "Like"} {likes} Likes
        </button>
    );
};

export default LikeButton;
