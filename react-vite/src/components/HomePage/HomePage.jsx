import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSongs } from "../../store/songsSlice";
import { fetchUsers } from "../../store/usersSlice";
import { fetchAlbums } from "../../store/albumsSlice";
import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
    const dispatch = useDispatch();
    const { songs } = useSelector((state) => state.songs);
    const { users } = useSelector((state) => state.users);
    const { albums } = useSelector((state) => state.albums);

    useEffect(() => {
        dispatch(fetchSongs());
        dispatch(fetchUsers());
        dispatch(fetchAlbums());
    }, [dispatch]);

    return (
        <div className="homepage-container">
            <section className="section">
                <h2>Songs</h2>
                <div className="list">
                    {songs.map((song) => (
                        <Link key={song.id} to={`/songs/${song.id}`} className="item">
                            {song.title}
                        </Link>
                    ))}
                </div>
            </section>

            <section className="section">
                <h2>Artists</h2>
                <div className="list">
                    {users.map((user) => (
                        <Link key={user.id} to={`/artists/${user.id}`} className="item">
                            {user.username}
                        </Link>
                    ))}
                </div>
            </section>

            <section className="section">
                <h2>Albums</h2>
                <div className="list">
                    {albums.map((album) => (
                        <Link key={album.id} to={`/albums/${album.id}`} className="item">
                            {album.title}
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
