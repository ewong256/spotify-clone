import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSongs, deleteSong } from "../../redux/songs"; 
import { FaHeart, FaPlay, FaEllipsisH, FaEdit, FaTrash } from "react-icons/fa"; 
import CreateSong from "../CreateSong/CreateSong.jsx";
import UpdateSong from "../UpdateSong/UpdateSong.jsx";
import "../SongPage/SongPage.css";

const SongPage = () => {
  const dispatch = useDispatch();
  const { songs, status, error } = useSelector((state) => state.songs);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);

  useEffect(() => {
    dispatch(fetchSongs());
  }, [dispatch]);

  if (status === "loading") return <p>Loading songs...</p>;
  if (status === "failed") return <p>Error: {error}</p>;

  const handleDelete = (songId) => {
    if (window.confirm("Are you sure you want to delete this song?")) {
      dispatch(deleteSong(songId));
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h2 className="text-3xl font-bold mb-6">All Songs</h2>

      {/* Create Song Button */}
      <button
        className="mb-4 p-2 bg-green-500 text-white rounded"
        onClick={() => setShowCreateForm(true)}
      >
        Add New Song
      </button>

      {/* Render Create Song Form */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <CreateSong onClose={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-2">#</th>
            <th>Cover</th> {/* New column for image */}
            <th>Title</th>
            <th>Audio</th> {/* New column for audio */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => (
            <tr key={song.id} className="border-b border-gray-800 hover:bg-gray-800">
              <td className="py-2">{index + 1}</td>
              {/* Display Song Image */}
              <td>
                <img src={song.image_url} alt={song.title} className="w-16 h-16 rounded" />
              </td>
              <td>{song.title}</td>
              {/* Audio Player */}
              <td>
                <audio controls src={song.song_url} className="w-full"></audio>
              </td>
              {/* Action Buttons */}
              <td>
                <button className="mr-2 hover:text-green-400">
                  <FaPlay />
                </button>
                <button className="mr-2 hover:text-red-400">
                  <FaHeart />
                </button>
                <button
                  className="mr-2 hover:text-blue-400"
                  onClick={() => setEditingSong(song)}
                >
                  <FaEdit />
                </button>
                {/* Delete Button */}
                <button
                  className="mr-2 hover:text-red-600"
                  onClick={() => handleDelete(song.id)}
                >
                  <FaTrash />
                </button>
                <button className="hover:text-gray-400">
                  <FaEllipsisH />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Render Update Song Form */}
      {editingSong && (
        <div className="modal-overlay">
          <div className="modal">
            <UpdateSong song={editingSong} closeModal={() => setEditingSong(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SongPage;