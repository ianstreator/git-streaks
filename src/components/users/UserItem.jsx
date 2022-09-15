import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useContext } from "react";
import GithubContext from "../../context/github/GithubContext";
import flame from "../layout/assets/streak-fire.svg";

function UserItem({ user: { login, avatar_url } }) {
  const { getUser, getUserRepos } = useContext(GithubContext);

  return (
    <Link
      className="text-base-content text-opacity-40"
      to={`/user/${login}`}
      onClick={() => {
        getUser(login);
        getUserRepos(login);
      }}
    >
      <div className="card shadow-md compact side bg-base-100 glass opacity-50 hover:opacity-100">
        <div className="flex-row items-center space-x-4 card-body">
          <div>
            <div className="avatar">
              <div className="rounded-full shadow w-14 h-14">
                <img src={avatar_url} alt="Profile" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="card-title">{login}</h2>
            View Profile
          </div>
          <img src={flame} alt="flame-icon" width={25} />
        </div>
      </div>
    </Link>
  );
}

UserItem.propTypes = {
  user: PropTypes.object.isRequired,
};

export default UserItem;
