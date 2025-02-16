import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../components/HomePage/HomePage';
import LoginFormPage from '../components/LoginFormPage';
import SignupFormPage from '../components/SignupFormPage';
import Layout from './Layout';
import SongsPage from '../components/SongPage/SongsPage';
import AlbumPage from '../components/AlbumPage/AlbumPage';


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
        element: <LoginFormPage />,
      },
      {
        path: "signup",
        element: <SignupFormPage />,
      },
      {
        path: "songs",  // ✅ Added SongsPage inside Layout
        element: <SongsPage />,
      },
      {
        path: "album/:albumId",
        element: <AlbumPage />,
      },
      
    ],
  },
]);