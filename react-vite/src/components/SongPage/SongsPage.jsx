import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSongs } from "../../redux/songs";
import { FaHeart, FaPlay, FaEllipsisH, FaEdit } from "react-icons/fa";
import CreateSong from "../CreateSong/CreateSong.jsx";
import UpdateSong from "../UpdateSong/UpdateSong.jsx";
import "../SongPage/SongPage.css";

const SongsPage = () => {
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

      <button
        className="mb-4 p-2 bg-green-500 text-white rounded"
        onClick={() => setShowCreateForm(true)}
      >
        Add New Song
      </button>

      {showCreateForm && <CreateSong />}

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-2">#</th>
            <th>Title</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => (
            <tr key={song.id} className="border-b border-gray-800 hover:bg-gray-800">
              <td className="py-2">{index + 1}</td>
              <td>{song.title}</td>
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
                <button className="hover:text-gray-400">
                  <FaEllipsisH />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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

export default SongsPage;
