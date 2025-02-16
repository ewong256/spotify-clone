import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSongs, addSong, editSong, deleteSong } from "../../redux/songs";
import { FaHeart, FaPlay, FaEllipsisH, FaTrash, FaEdit } from "react-icons/fa";
import "./SongPage.css";

const SongsPage = () => {
  const dispatch = useDispatch();
  const { songs, status, error } = useSelector((state) => state.songs);
  const currentUser = useSelector((state) => state.session.user); // Check for authenticated user

  const [newSong, setNewSong] = useState({ title: "", song_url: "", album_id: 1 });
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    dispatch(fetchSongs());
  }, [dispatch]);

  const handleAddSong = (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You must be logged in to add a song.");
      return;
    }
    dispatch(addSong(newSong));
    setNewSong({ title: "", song_url: "", album_id: 1 });
  };

  const handleEditSong = (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You must be logged in to edit a song.");
      return;
    }
    if (editData) {
      dispatch(editSong(editData.id, editData));
      setEditData(null);
    }
  };

  const handleDeleteSong = (songId) => {
    if (!currentUser) {
      alert("You must be logged in to delete a song.");
      return;
    }
    dispatch(deleteSong(songId));
  };

  if (status === "loading") return <p>Loading songs...</p>;
  if (status === "failed") return <p>Error: {error}</p>;

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h2 className="text-3xl font-bold mb-6">All Songs</h2>

      {/* Show form only if user is logged in */}
      {currentUser && (
        <>
          {/* Add New Song Form */}
          <form onSubmit={handleAddSong} className="mb-6">
            <input
              type="text"
              value={newSong.title}
              onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
              placeholder="Song Title"
              className="p-2 border rounded"
            />
            <input
              type="text"
              value={newSong.song_url}
              onChange={(e) => setNewSong({ ...newSong, song_url: e.target.value })}
              placeholder="Song URL"
              className="p-2 border rounded"
            />
            <button type="submit" className="ml-2 bg-green-500 text-white px-4 py-2 rounded">
              Add Song
            </button>
          </form>

          {/* Edit Song Form */}
          {editData && (
            <form onSubmit={handleEditSong} className="mb-6">
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="p-2 border rounded"
              />
              <button type="submit" className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">
                Save Changes
              </button>
            </form>
          )}
        </>
      )}

      {/* Songs Table */}
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
                {currentUser && (
                  <>
                    <button
                      className="mr-2 hover:text-blue-400"
                      onClick={() => setEditData(song)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="hover:text-gray-400"
                      onClick={() => handleDeleteSong(song.id)}
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SongsPage;
