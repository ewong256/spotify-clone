import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSongs } from "../../redux/songs";

const UserProfile = ({ userId }) => {
  const dispatch = useDispatch();

 
  const { songs, status, error } = useSelector((state) => state.songs);

  useEffect(() => {
    dispatch(fetchSongs(userId));
  }, [dispatch, userId]);

  if (status === "loading") return <p>Loading songs...</p>;
  if (status === "failed") return <p>Error loading songs: {error}</p>;

  return (
    <div>
      <h2>Songs Uploaded</h2>
      {songs.length > 0 ? (
        songs.map((song) =>
          song ? (
            <div key={song.id}>
              <p>{song.title}</p>
            </div>
          ) : null
        )
      ) : (
        <p>No songs uploaded.</p>
      )}
    </div>
  );
};

export default UserProfile;
