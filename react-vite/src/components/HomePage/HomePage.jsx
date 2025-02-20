import { useEffect, useState } from "react"; // Added useState for available songs
import { useSelector, useDispatch } from "react-redux";
import { fetchSongs } from "../../redux/songs";
import { 
  thunkFetchAllPlaylists, 
  thunkAddSong, 
  thunkRemoveSong 
} from "../../redux/playlistReducer";
import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
    const dispatch = useDispatch();
    const { songs, status: songsStatus, error: songsError } = useSelector((state) => state.songs);
    const playlists = useSelector((state) => state.playlists); // Object of playlists
    const currentUser = useSelector((state) => state.session.user);

    const [availableSongs, setAvailableSongs] = useState([]); // To pick a song for add/remove

    useEffect(() => {
        // Fetch songs
        dispatch(fetchSongs());

        // Fetch playlists
        if (currentUser?.id) {
            dispatch(thunkFetchAllPlaylists());
        }
    }, [dispatch, currentUser]);

    // Fetch available songs and trigger add/remove for a playlist
    useEffect(() => {
        if (currentUser?.id) {
            // Fetch available songs for a sample playlist (e.g., first playlist ID)
            const firstPlaylistId = Object.keys(playlists)[0];
            if (firstPlaylistId) {
                fetch(`/api/playlists/${firstPlaylistId}/songs`, {
                    credentials: "include",
                })
                    .then((res) => res.json())
                    .then((data) => {
                        console.log("Playlist available songs:", data);
                        const available = data.available_songs || [];
                        setAvailableSongs(available);

                        // Add and remove a song to update playlist songs
                        if (available.length > 0) {
                            const songToAdd = available[0].id;
                            dispatch(thunkAddSong(firstPlaylistId, songToAdd)).then((success) => {
                                if (success) {
                                    dispatch(thunkRemoveSong(firstPlaylistId, songToAdd));
                                }
                            });
                        }
                    })
                    .catch(() => console.error("Failed to fetch available songs"));
            }
        }
    }, [dispatch, currentUser, playlists]);

    return (
        <div className="homepage-container">
            <section className="section">
                <h2>Songs</h2>
                {songsStatus === "loading" && <p>Loading songs...</p>}
                {songsError && <p className="error">Error loading songs: {songsError}</p>}
                {songs.length > 0 && (
                    <div className="list">
                        {songs.map((song) => (
                            <Link key={song.id} to={`/songs`} className="item">
                                {song.title}
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section className="section">
                <h2>Playlists</h2>
                {Object.values(playlists).length > 0 ? (
                    <div className="list">
                        {Object.values(playlists).map((pl) => (
                            <Link key={pl.id} to={`/playlists/${pl.id}`} className="item">
                                {pl.title}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p>No playlists available.</p>
                )}
                {currentUser && (
                    <Link to="/playlists">
                        <button className="manage-playlists-btn">Manage Playlists</button>
                    </Link>
                )}
            </section>
        </div>
    );
};

export default HomePage;
