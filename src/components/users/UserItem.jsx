import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import sleep from "../layout/assets/sleepy-coder-icon.svg";
import yearly from "../layout/assets/yearly-contribution-icon.svg";
import best from "../layout/assets/best-streak-icon.svg";
import current from "../layout/assets/current-streak-icon.svg";
import watching from "../layout/assets/watching-coder.svg";
import not_watching from "../layout/assets/not-watching-coder.svg";

import { useContext, useState } from "react";
import GithubContext from "../../context/github/GithubContext";
import { useEffect } from "react";
import Loader from "../layout/Loader";

function UserItem({ user }) {
  const { updateWatchlist, watchlist, users } = useContext(GithubContext);
  const { login, avatar_url, userContributionData, updating } = user;
  const { currentStreak, bestStreak, yearlyContributions } =
    userContributionData;
  const [watchChange, setWatchChange] = useState(watchlist[login]);
  console.log(updating, login);

  const [streak, setStreak] = useState(currentStreak);
  const [highestStreak, setHighestStreak] = useState(bestStreak);
  const [annualContributions, setAnnualContributions] =
    useState(yearlyContributions);

  console.log(streak, highestStreak, annualContributions);
  useEffect(() => {
    setWatchChange(watchlist[login]);
  }, [watchlist, users]);

  return (
    <div className="card shadow-md compact side bg-zinc-700 opacity-40 hover:opacity-100 w-96">
      {updating && (
        <div className="absolute py-11 px-20 text-6xl z-[100] w-full h-full text-xl bg-black/[0.6] text-white flex flex-row">
          Updating
          <Loader />
        </div>
      )}
      <div className="relative flex-row space-x-1 card-body">
        <div className="avatar">
          <div className="rounded-full shadow w-20">
            <img src={avatar_url} alt="Profile" />
          </div>
        </div>

        <div className="w-full">
          <div className="flex">
            <div className="flex-col">
              <Link className="text-base-content w-fit" to={`/user/${login}`}>
                <h2
                  className="card-title opacity-50 hover:opacity-100 transition"
                  title="view profile"
                >
                  {login}
                </h2>
              </Link>
            </div>

            <img
              src={watchChange ? watching : not_watching}
              alt="eyes"
              width={23}
              title={
                watchChange ? "remove from watch list" : "add to watch list"
              }
              className={`mx-1 ml-auto cursor-pointer`}
              onClick={() => {
                updateWatchlist({
                  user,
                  action: watchlist[login] ? "delete" : "add",
                });
              }}
            />
          </div>
          <div className=" flex justify-between bg-zinc-800 rounded bg-opacity-60 w-full">
            <div
              className="bg-zinc-800 pr-2 p-1 m-1 flex rounded"
              title="current streak"
            >
              <img
                src={currentStreak > 0 ? current : sleep}
                alt="current-icon"
                width={20}
                className="mx-1"
              />
              <p className="text-2xl ml-1">{currentStreak}</p>
            </div>
            <div
              className="bg-zinc-800 pr-2 p-1 m-1 flex rounded"
              title="best streak"
            >
              <img src={best} alt="current-icon" width={20} className="mx-1" />
              <p className="text-2xl ml-1">{bestStreak}</p>
            </div>
            <div
              className="bg-zinc-800 pr-2 p-1 m-1 flex rounded"
              title="yearly contributions"
            >
              <img
                src={yearly}
                alt="current-icon"
                width={20}
                className="mx-1"
              />
              <p className="text-2xl ml-1">{yearlyContributions}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

UserItem.propTypes = {
  user: PropTypes.object.isRequired,
};

export default UserItem;
