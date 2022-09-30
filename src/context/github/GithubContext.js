import { createContext, useEffect, useReducer } from "react";
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
      if (localStorageKeys[i] === "ally-supports-cache") continue;
      let userData = JSON.parse(localStorage.getItem(localStorageKeys[i]));
      const saveTime = new Date(userData.local_storage_save_time);
      const currTime = new Date();
      const notSameDay = saveTime.getUTCDate() !== currTime.getUTCDate();
      if (notSameDay && typeof saveTime.getUTCDate() === "number") {
        updateWatchlist({ user: userData, action: "update" });
      } else {
        savedUsers[userData.login] = userData;
      }
    }
    if (Object.keys(savedUsers).length) {
      dispatch({ type: "SET_WATCHLIST", payload: { ...savedUsers } });
      dispatch({ type: "SET_USERS", payload: { ...savedUsers } });
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
    setLoading(true);

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
      payload: { ...restructuredData, ...state.watchlist },
    });
    return items.length;
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
      localStorage.removeItem(username);

      delete state.watchlist[username];

      dispatch({ type: "SET_WATCHLIST", payload: { ...state.watchlist } });
    }

    if (action === "add") {
      const newLocalStorageUser = {
        ...user,
        local_storage_save_time: Date.now(),
      };

      localStorage.setItem(username, JSON.stringify(newLocalStorageUser));

      const newWatchListUser = {};

      newWatchListUser[username] = newLocalStorageUser;

      dispatch({
        type: "SET_WATCHLIST",
        payload: { ...newWatchListUser, ...state.watchlist },
      });
    }

    if (action === "update") {
      const updatedUserData = await getUsersContributionData(user);

      updatedUserData.local_storage_save_time = Date.now();

      state.watchlist[username] = updatedUserData;
      state.users[username] = updatedUserData;

      localStorage.setItem(username, JSON.stringify(updatedUserData));

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
