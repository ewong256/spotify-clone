import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../components/HomePage/HomePage';
import LoginFormPage from '../components/LoginFormPage';
import SignupFormPage from '../components/SignupFormPage';
import Layout from './Layout';
import Playlist from '../components/PlaylistPage/Playlists';
import SongsPage from '../components/SongPage/SongsPage';


export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginFormPage />
      },
      {
        path: "signup",
        element: <SignupFormPage />
      },
      {
        path: "playlists",
        element: <Playlist />
      },
      {
        path: "playlists/:playlistId",
        element: <Playlist />
      },
      {
        path: "songs",  // ✅ Added SongsPage inside Layout
        element: <SongsPage />,
      },

    ],
  },
]);
