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

  useEffect(() => {
    if (!localStorage.getItem(watchListKey)) return;
    const parsedWatchList = JSON.parse(localStorage.getItem(watchListKey));
    const localStorageWatchList = Object.keys(parsedWatchList);

    dispatch({ type: "SET_WATCHLIST", payload: { ...parsedWatchList } });
    dispatch({ type: "SET_USERS", payload: { ...parsedWatchList } });
    for (let i = 0; i < localStorageWatchList.length; i++) {
      let userData = parsedWatchList[localStorageWatchList[i]];
      const saveTime = new Date(userData.local_storage_save_time);
      const currTime = new Date();
      const notSameDay = saveTime.getUTCDate() === currTime.getUTCDate();

      if (notSameDay && typeof saveTime.getUTCDate() === "number") {
        dispatch({
          type: "SET_USERS",
          payload: {
            ...parsedWatchList,
            [localStorageWatchList[i]]: {
              ...userData,
              updating: true,
            },
          },
        });
        updateWatchlist({ user: userData, action: "update" });
      }
    }
  }, []);

  const searchUsers = async (text) => {
    setLoading(true);

    const params = new URLSearchParams({
      q: text,
    });

    const res = await fetch(`${GITHUB_URL}/search/users?${params}`);
    const { items } = await res.json();
    if (!items.length) {
      setLoading(false);
      return undefined;
    }

    const filterCurrentUsernames = items.filter((item) => {
      return !state.watchlist[item.login];
    });
    if (filterCurrentUsernames.length === 0) return setLoading({ data: false });
    const data = await getUsersContributionData(filterCurrentUsernames);

    const restructuredData = {};
    data.forEach((user) => {
      restructuredData[user.login] = user;
    });
    dispatch({
      type: "SET_USERS",
      payload: { ...state.watchlist, ...restructuredData },
    });
    setLoading(false);
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
    dispatch({ type: "SET_USERS", payload: { ...state.watchlist } });
  };

  const setLoading = (data) => {
    dispatch({ type: "SET_LOADING", payload: data });
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
          updating: false,
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
      if (!updatedUserData.userContributionData) return;
      updatedUserData.local_storage_save_time = Date.now();

      state.watchlist[username] = updatedUserData;

      localStorage.setItem(watchListKey, JSON.stringify(state.watchlist));

      dispatch({
        type: "SET_WATCHLIST",
        payload: { ...state.watchlist },
      });
      dispatch({
        type: "SET_USERS",
        payload: { ...state.watchlist },
      });
      updatedUserData.updating = false;
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
