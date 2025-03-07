import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSongs, deleteSong } from "../../redux/songs";
import { FaHeart, FaPlay, FaEllipsisH, FaEdit, FaTrash } from "react-icons/fa";
import CreateSong from "../CreateSong/CreateSong.jsx";
import UpdateSong from "../UpdateSong/UpdateSong.jsx";
import LikeButton from "../Likes/likes";
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
            <th>Cover</th>
            <th>Title</th>
            <th>Audio</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => (
            <SongDetail key={song.id} song={song} index={index} setEditingSong={setEditingSong} />
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

function SongDetail({ song, index, setEditingSong }) {
  const dispatch = useDispatch();

  const handleDelete = async (songId) => {
    if (!window.confirm("Are you sure you want to delete this song?")) return;
  
    try {
      const response = await dispatch(deleteSong(songId));
  
      if (response.error) {
        if (response.error.message.includes("Unauthorized")) {
          alert("Sorry, this is not your song.");
        } else {
          alert("An error occurred while trying to delete the song.");
        }
      }
    } catch (error) {
      alert("An error occurred while trying to delete the song.");
    }
  };

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800">
      <td className="py-2">{index + 1}</td>
      <td>
        <img src={song.image_url} alt={song.title} className="w-16 h-16 rounded" />
      </td>
      <td>{song.title}</td>
      <td>
        <audio controls src={song.song_url} className="w-full"></audio>
      </td>
      <td>
        <button className="mr-2 hover:text-green-400">
          <FaPlay />
        </button>
        <LikeButton song={song} />
        <button className="mr-2 hover:text-blue-400" onClick={() => setEditingSong(song)}>
          <FaEdit />
        </button>
        <button className="mr-2 hover:text-red-600" onClick={() => handleDelete(song.id)}>
          <FaTrash />
        </button>
        <button className="hover:text-gray-400">
          <FaEllipsisH />
        </button>
      </td>
    </tr>
  );
}

export default SongPage;
