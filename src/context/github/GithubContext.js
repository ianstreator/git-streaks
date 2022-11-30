import { createContext, useEffect, useReducer, useState } from "react";
import githubReducer from "./GithubReducer";

const GithubContext = createContext();

const GITHUB_URL = process.env.REACT_APP_GITHUB_URL;

const watchListKey = "gitstreaks:watchlist";

const isdev = window.location.href.includes("localhost");
const ENV_API_URL = isdev
  ? process.env.REACT_APP_DEV_API_URL
  : process.env.REACT_APP_PROD_API_URL;

export const GithubProvider = ({ children }) => {
  const initialState = {
    users: {},
    watchlist: {},
    user: {},
    repos: [],
    loading: false,
  };
  const [state, dispatch] = useReducer(githubReducer, initialState);

  const [usersToDisplay, setUsersToDisplay] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem(watchListKey)) return;
    const parsedWatchList = JSON.parse(localStorage.getItem(watchListKey));
    const localStorageWatchList = Object.keys(parsedWatchList);
    const savedUsers = {};
    for (let i = 0; i < localStorageWatchList.length; i++) {
      let userData = parsedWatchList[localStorageWatchList[i]];
      const saveTime = new Date(userData.local_storage_save_time);
      const currTime = new Date();
      const notSameDay = saveTime.getUTCDate() !== currTime.getUTCDate();
      if (notSameDay && typeof saveTime.getUTCDate() === "number") {
        setLoading({ data: true, watchlist: true });
        updateWatchlist({ user: userData, action: "update" });
      } else {
        savedUsers[userData.login] = userData;
      }
    }
    if (Object.keys(savedUsers).length >= 1) {
      dispatch({ type: "SET_WATCHLIST", payload: { ...savedUsers } });
      dispatch({ type: "SET_USERS", payload: { ...savedUsers } });
      setUsersToDisplay([...Object.values(parsedWatchList)]);
    }
  }, []);

  const searchUsers = async (text) => {
    const params = new URLSearchParams({
      q: text,
    });

    const res = await fetch(`${GITHUB_URL}/search/users?${params}`);
    const { items } = await res.json();
    if (!items.length) {
      return undefined;
    }
    setLoading({ data: true });

    const filterCurrentUsernames = items.filter((item) => {
      return !state.watchlist[item.login];
    });
    if (filterCurrentUsernames.length === 0) return setLoading({ data: false });
    const data = await getUsersContributionData(filterCurrentUsernames);

    const restructuredData = {};
    data.forEach((user) => {
      restructuredData[user.login] = user;
    });
    setUsersToDisplay([...data, ...Object.values(state.watchlist)]);
    dispatch({
      type: "SET_USERS",
      payload: { ...state.watchlist, ...restructuredData },
    });
    return true;
  };

  const getUsersContributionData = async (users) => {
    const api_res = await fetch(`${ENV_API_URL}/api/index`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(users),
    });
    const data = await api_res.json();
    return data;
  };

  const getUser = async (login) => {
    setLoading({ data: true });
    const res = await fetch(`${GITHUB_URL}/users/${login}`);

    if (res.status === 404) {
      return (window.location = "/notfound");
    } else {
      const data = await res.json();
      dispatch({ type: "SET_USER", payload: data });
    }
  };

  const getUserRepos = async (login) => {
    setLoading({ data: true });

    const params = new URLSearchParams({
      sort: "created",
      per_page: 10,
    });

    const res = await fetch(`${GITHUB_URL}/users/${login}/repos?${params}`);
    let data = await res.json();
    dispatch({ type: "SET_REPOS", payload: data });
  };

  const clearUsers = () => {
    setUsersToDisplay([...Object.values(state.watchlist)]);
    dispatch({ type: "SET_USERS", payload: { ...state.watchlist } });
  };

  const setLoading = ({ data, watchlist = false }) => {
    dispatch({ type: "SET_LOADING", payload: { data, watchlist } });
  };

  const updateWatchlist = async ({ user, action }) => {
    const username = user.login;

    if (action === "delete") {
      delete state.watchlist[username];
      const localStorageWatchList = JSON.stringify({ ...state.watchlist });
      localStorage.setItem(watchListKey, localStorageWatchList);
      dispatch({ type: "SET_WATCHLIST", payload: { ...state.watchlist } });
    }

    if (action === "add") {
      const newWatchListUser = {
        [username]: {
          ...user,
          local_storage_save_time: Date.now(),
        },
      };
      const setLocalStorageWatchList = {
        ...state.watchlist,
        ...newWatchListUser,
      };
      localStorage.setItem(
        watchListKey,
        JSON.stringify({ ...setLocalStorageWatchList })
      );
      dispatch({
        type: "SET_WATCHLIST",
        payload: { ...setLocalStorageWatchList },
      });
    }

    if (action === "update") {
      const updatedUserData = await getUsersContributionData(user);

      updatedUserData.local_storage_save_time = Date.now();

      state.users[username] = updatedUserData;
      state.watchlist[username] = updatedUserData;

      localStorage.setItem(watchListKey, JSON.stringify(state.watchlist));

      dispatch({ type: "SET_USERS", payload: { ...state.users } });
      dispatch({ type: "SET_WATCHLIST", payload: { ...state.watchlist } });
    }
  };

  return (
    <GithubContext.Provider
      value={{
        ...state,
        searchUsers,
        getUser,
        getUserRepos,
        clearUsers,
        updateWatchlist,
        usersToDisplay,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export default GithubContext;
