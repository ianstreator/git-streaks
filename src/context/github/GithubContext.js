import { createContext, useEffect, useReducer, useState } from "react";
import githubReducer from "./GithubReducer";

const GithubContext = createContext();

const GITHUB_URL = process.env.REACT_APP_GITHUB_URL;

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

  useEffect(() => {
    const localStorageKeys = Object.keys(localStorage);
    const savedUsers = {};

    for (let i = 0; i < localStorageKeys.length; i++) {
      let userData = JSON.parse(localStorage.getItem(localStorageKeys[i]));
      savedUsers[userData.login] = userData;
    }

    dispatch({ type: "SET_WATCHLIST", payload: { ...savedUsers } });
    dispatch({ type: "SET_USERS", payload: { ...savedUsers } });
  }, []);

  const searchUsers = async (text) => {
    setLoading(true);

    const params = new URLSearchParams({
      q: text,
    });

    const res = await fetch(`${GITHUB_URL}/search/users?${params}`);

    if (res.status === 404) return (window.location = "/notfound");

    const { items } = await res.json();

    const watchlistNames = Object.keys(state.watchlist);
    const filterCurrentUsernames = items.filter((item) => {
      return !watchlistNames.includes(item.login);
    });
    if (filterCurrentUsernames.length === 0) return setLoading(false);
    const data = await getUsersContributionData(filterCurrentUsernames);

    const restructuredData = {};
    data.forEach((user) => {
      restructuredData[user.login] = user;
    });
    dispatch({
      type: "SET_USERS",
      payload: { ...state.watchlist, ...restructuredData },
    });
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
    setLoading(true);
    const res = await fetch(`${GITHUB_URL}/users/${login}`);

    if (res.status === 404) {
      return (window.location = "/notfound");
    } else {
      const data = await res.json();
      dispatch({ type: "SET_USER", payload: data });
    }
  };

  const getUserRepos = async (login) => {
    setLoading(true);

    const params = new URLSearchParams({
      sort: "created",
      per_page: 10,
    });

    const res = await fetch(`${GITHUB_URL}/users/${login}/repos?${params}`);
    let data = await res.json();
    dispatch({ type: "SET_REPOS", payload: data });
  };

  const clearUsers = () => {
    dispatch({ type: "SET_USERS", payload: [] });
  };

  const setLoading = (data) => {
    dispatch({ type: "SET_LOADING", payload: data });
  };

  const updateWatchlist = async ({ user, action }) => {
    if (action === "delete") {
      localStorage.removeItem(user.login);
      delete state.watchlist[user.login];
      dispatch({ type: "SET_WATCHLIST", payload: { ...state.watchlist } });
    }
    if (action === "add") {
      const localUser = {
        ...user,
        local_storage_save_time: Date.now(),
      };
      localStorage.setItem(user.login, JSON.stringify(localUser));
      const addToWatchlist = {};
      addToWatchlist[user.login] = localUser;
      dispatch({
        type: "SET_WATCHLIST",
        payload: { ...addToWatchlist, ...state.watchlist },
      });
    }
    if (action === "update") {
      const newData = await getUsersContributionData([user]);
      const userObj = newData[0];

      const currTime = new Date();
      const updatedUser = {};

      updatedUser[user.login] = userObj;
      updatedUser[user.login].local_storage_save_time = currTime;

      state.watchlist[user.login] = updatedUser[user.login];
      state.users[user.login] = updatedUser[user.login];

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
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export default GithubContext;
