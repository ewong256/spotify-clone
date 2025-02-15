import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLikes, likeSongs, unlikeSongs } from "../../redux/likes";

const LikeButton = ({ songId }) => {
    const dispatch = useDispatch()
    const likes = useSelector((state) => state.likes[songId] || 0)
    const [liked, setLiked] = useState(false)

    useEffect(() => {
        dispatch(fetchLikes(songId));
    }, [dispatch, songId])

    const handleLike = async () => {
        if (liked) {
            await dispatch(unlikeSongs(songId));
        } else {
            await dispatch(likeSongs(songId));
        }
        setLiked(!liked);
    }

    return (
        <button onClick={handleLike} className={`like-button ${liked ? "liked": ""}`}>
            {liked ? "" : ""} {likes} Likes
        </button>
    )
};

export default LikeButton;
