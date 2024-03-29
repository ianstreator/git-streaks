import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import streakIcon from "../layout/assets/current-streak-icon.svg";
import sleepyIcon from "../layout/assets/sleepy-coder-icon.svg";
import bestIcon from "../layout/assets/best-streak-icon.svg";
import calendarIcon from "../layout/assets/yearly-contribution-icon.svg";
import watching from "../layout/assets/watching-coder.svg";
import not_watching from "../layout/assets/not-watching-coder.svg";

import { useContext, useState } from "react";
import GithubContext from "../../context/github/GithubContext";
import { useEffect } from "react";
import Loader from "../layout/Loader";

function UserItem({ user }) {
  const {
    login,
    avatar_url,
    userContributionData: { currentStreak, bestStreak, yearlyContributions },
    updating,
  } = user;

  const cardFeatureValues = [
    {
      src: currentStreak > 0 ? streakIcon : sleepyIcon,
      alt: "current-icon",
      title: "current streak",
      value: currentStreak,
    },
    {
      src: bestIcon,
      alt: "best-icon",
      title: "best streak",
      value: bestStreak,
    },
    {
      src: calendarIcon,
      alt: "calendar-icon",
      title: "year to date contributions",
      value: yearlyContributions,
    },
  ];

  const { removeFromWatchList, addToWatchList, watchlist, users } =
    useContext(GithubContext);

  const [watchChange, setWatchChange] = useState(watchlist[login]);

  useEffect(() => {
    setWatchChange(watchlist[login]);
  }, [watchlist, users]);

  return (
    <div className="relative card rounded-l-full shadow-md compact side bg-zinc-700 opacity-40 hover:opacity-100 w-96 mx-auto">
      {updating && (
        <div className="absolute z-[100] w-full h-full text-xl bg-black/[0.6] text-white flex flex-row justify-center items-center">
          Updating
          <Loader />
        </div>
      )}
      <div className="relative flex-row space-x-1 card-body !p-2">
        <div className="avatar">
          <div className="rounded-full shadow w-20 h-20 m-auto">
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
              onClick={() =>
                watchlist[login]
                  ? removeFromWatchList(user)
                  : addToWatchList(user)
              }
            />
          </div>
          <div className="flex justify-between bg-zinc-800 rounded bg-opacity-60 w-full">
            {cardFeatureValues.map(({ src, alt, title, value }) => (
              <div
                className="bg-zinc-800 pr-2 p-1 m-1 flex rounded"
                title={title}
              >
                <img src={src} alt={alt} width={20} className="mx-1" />
                <p className="text-2xl ml-1">{value}</p>
              </div>
            ))}
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
