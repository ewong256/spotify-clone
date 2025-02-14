import { useState, useEffect } from "react";
import { FaHeart, FaPlay, FaEllipsisH } from "react-icons/fa";
import "./SongPage.css"; 

const SongsPage = () => {
    const [songs, setSongs] = useState([]);
    const [users, setUsers] = useState([]);
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
        
        fetch("/api/songs")
            .then((res) => res.json())
            .then((data) => setSongs(data.songs))
            .catch((err) => console.error("Error fetching songs:", err));

        
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => setUsers(data.users))
            .catch((err) => console.error("Error fetching users:", err));

        fetch("/api/albums")
            .then((res) => res.json())
            .then((data) => setAlbums(data.albums))
            .catch((err) => console.error("Error fetching albums:", err));
    }, []);

    
    const getArtistName = (userId) => {
        const user = users.find((user) => user.id === userId);
        return user ? user.username : "Unknown Artist";
    };


    const getAlbumTitle = (albumId) => {
        const album = albums.find((album) => album.id === albumId);
        return album ? album.title : "Unknown Album";
    };

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
