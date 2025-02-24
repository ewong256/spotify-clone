import { useEffect, useState } from "react";
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
    
    // Get data from Redux store
    const { songs, status: songsStatus, error: songsError } = useSelector((state) => state.songs);
    const playlists = useSelector((state) => state.playlists);
    const currentUser = useSelector((state) => state.session.user);

    // Local state for albums (instead of Redux)
    const [albums, setAlbums] = useState([]);
    const [albumsError, setAlbumsError] = useState(null);

    // Local state for available songs in playlists
    const [availableSongs, setAvailableSongs] = useState([]);

    useEffect(() => {
        // Fetch songs
        dispatch(fetchSongs());

        // Fetch playlists if user is logged in
        if (currentUser?.id) {
            dispatch(thunkFetchAllPlaylists());
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (currentUser?.id) {
            const firstPlaylistId = Object.keys(playlists)[0];
            if (firstPlaylistId) {
                fetch(`/api/playlists/${firstPlaylistId}/songs`, {
                    credentials: "include",
                })
                    .then((res) => res.json())
                    .then((data) => {
                        const available = data.available_songs || [];
                        setAvailableSongs(available);

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

    useEffect(() => {
        // Fetch albums (without using Redux)
        const fetchAlbums = async () => {
            try {
                const response = await fetch("/api/albums");
                if (!response.ok) throw new Error("Failed to fetch albums.");
                const data = await response.json();
                setAlbums(data);
            } catch (err) {
                setAlbumsError(err.message);
            }
        };
        fetchAlbums();
    }, []);

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
                <h2>Albums</h2>
                {albumsError && <p className="error">Error loading albums: {albumsError}</p>}
                {albums.length > 0 ? (
                    <div className="list">
                        {albums.map((album) => (
                            <Link key={album.id} to={`/album/${album.id}`} className="album-item">
                                <img src={album.image_url} alt={`${album.title} cover`} className="album-cover" />
                                <p>{album.title}</p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p>No albums available.</p>
                )}
            </section>

            <section className="section">
                <h2>Playlists</h2>
                {Object.values(playlists).length > 0 ? (
                    <div className="list">
                        {Object.values(playlists).map((pl) => (
                            <Link key={pl.id} to={`/playlists/${pl.id}`} className="item">
                                {pl.name}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p>No playlists available.</p>
                )}
            </section>
        </div>
    );
};

export default HomePage;
