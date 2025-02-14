import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaSpotify } from "react-icons/fa"; // Spotify icon
import ProfileButton from "./ProfileButton";
import "./Navigation.css";

function Navigation() {
  const user = useSelector((state) => state.session.user);

  return (
    <nav className="nav-bar">
      <div className="nav-left">
        <NavLink to="/" className="home-link">
          <FaSpotify className="spotify-icon" />
          <span>BeatFlow</span>
        </NavLink>
      </div>

      <div className="nav-right">
        <ProfileButton />
      </div>
    </nav>
  );
}

export default Navigation;
