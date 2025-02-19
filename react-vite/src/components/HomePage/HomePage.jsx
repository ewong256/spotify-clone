import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSongs } from "../../redux/songs";
import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
    const dispatch = useDispatch();
    const { songs, status: songsStatus, error: songsError } = useSelector((state) => state.songs);

    useEffect(() => {
        dispatch(fetchSongs());
    }, [dispatch])
    return (
        <div className="homepage-container">
            <section className="section">
                <h2>Songs</h2>

                {songsStatus === "loading" && <p>Loading songs...</p>}
                {songsError && <p className="error">Error loading songs: {songsError}</p>}

                {songs.length > 0 && (
                    <div className="list">
                        {songs.map((song) => (
                            <Link key={song.id} to={`/songs/${song.id}`} className="item">
                                {song.title}
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomePage;
