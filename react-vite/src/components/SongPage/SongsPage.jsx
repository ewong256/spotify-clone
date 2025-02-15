import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaHeart, FaPlay, FaEllipsisH } from "react-icons/fa";
import { fetchSongs } from "../../redux/SongsSlice.js";
// import { fetchUsers } from "../../redux/usersSlice";
// import { fetchAlbums } from "../../redux/albumsSlice";
import "./SongPage.css";

const SongsPage = () => {
    const dispatch = useDispatch();
    const { songs, status: songsStatus, error: songsError } = useSelector((state) => state.songs);
    const { users } = useSelector((state) => state.users);
    const { albums } = useSelector((state) => state.albums);

    useEffect(() => {
        if (songsStatus === "idle") dispatch(fetchSongs());
        dispatch(fetchUsers());
        dispatch(fetchAlbums());
    }, [songsStatus, dispatch]);

    const getArtistName = (userId) => {
        const user = users.find((user) => user.id === userId);
        return user ? user.username : "Unknown Artist";
    };

    const getAlbumTitle = (albumId) => {
        const album = albums.find((album) => album.id === albumId);
        return album ? album.title : "Unknown Album";
    };

    if (songsStatus === "loading") return <p>Loading songs...</p>;
    if (songsStatus === "failed") return <p>Error: {songsError}</p>;

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white">
            <h2 className="text-3xl font-bold mb-6">All Songs</h2>
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-gray-700">
                        <th className="py-2">#</th>
                        <th>Title</th>
                        <th>Artist</th>
                        <th>Album</th>
                        <th>Duration</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {songs.map((song, index) => (
                        <tr key={song.id} className="border-b border-gray-800 hover:bg-gray-800">
                            <td className="py-2">{index + 1}</td>
                            <td>{song.title}</td>
                            <td>{getArtistName(song.user_id)}</td>
                            <td>{getAlbumTitle(song.album_id)}</td>
                            <td>{song.duration}</td>
                            <td>
                                <button className="mr-2 hover:text-green-400">
                                    <FaPlay />
                                </button>
                                <button className="mr-2 hover:text-red-400">
                                    <FaHeart />
                                </button>
                                <button className="hover:text-gray-400">
                                    <FaEllipsisH />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SongsPage;
