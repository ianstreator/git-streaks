import { FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Logo from "./assets/git-streaks.svg"

function Navbar({ title }) {
  return (
    <nav className="navbar mb-12 shadow-lg bg-neutral text-neutral-content">
      <div className="container mx-auto">
        <div className="flex-none px-2 mx-2">
          <img src={Logo} alt="Logo" width={35} className="inline pr-2 text-3xl"/>
          <Link to={"/"} className="text-xl font-bold align-middle">
            {title}
          </Link>
        </div>
        <div className="flex-1 px-2 mx-2">
          <div className="flex justify-end">
            <Link to={"/"} className="btn btn-ghost btn-sm rounded-btn">
              Home
            </Link>
            <Link to={"/about"} className="btn btn-ghost btn-sm rounded-btn">
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

Navbar.defaultProps = {
  title: "Git-Streaks",
};

Navbar.propTypes = {
  title: PropTypes.string,
};

export default Navbar;
