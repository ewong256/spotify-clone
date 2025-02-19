import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSongs } from "../../redux/songs";
import { FaHeart, FaPlay, FaEllipsisH } from "react-icons/fa";
import LikeButton from "../Likes/likes";
import "./SongPage.css";

const SongsPage = () => {
  const dispatch = useDispatch();
  const { songs, status, error } = useSelector((state) => state.songs);

  useEffect(() => {
    dispatch(fetchSongs());
  }, [dispatch]);

  if (status === "loading") return <p>Loading songs...</p>;
  if (status === "failed") return <p>Error: {error}</p>;

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h2 className="text-3xl font-bold mb-6">All Songs</h2>
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

    <SongDetail key={song.id} song={song} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

function SongDetail({ song, index }) {
  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800">
    <td className="py-2">{index + 1}</td>
    <td>{song.title}</td>
    <td>
      <button className="mr-2 hover:text-green-400">
        <FaPlay />
      </button>
      <LikeButton key={song.id} song={song} />
      <button className="hover:text-gray-400">
        <FaEllipsisH />
      </button>
    </td>
  </tr>
  )
}

export default SongsPage;
