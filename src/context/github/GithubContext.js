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
    users: [],
    usernames: "",
    user: {},
    repos: [],
    loading: false,
  };
  const [state, dispatch] = useReducer(githubReducer, initialState);

  useEffect(() => {
    const localStorageKeys = Object.keys(localStorage);
    const savedUsers = [];

    for (let i = 0; i < localStorageKeys.length; i++) {
      const userData = JSON.parse(localStorage.getItem(localStorageKeys[i]));
      savedUsers.push(userData);
    }
    dispatch({ type: "SET_USERS", payload: savedUsers });
    setUsernames({ names: savedUsers, action: "ADD" });
  }, []);

  const searchUsers = async (text) => {
    setLoading();
    const params = new URLSearchParams({
      q: text,
    });
    const res = await fetch(`${GITHUB_URL}/search/users?${params}`);
    if (res.status === 404) return (window.location = "/notfound");

    const { items } = await res.json();
    const filterCurrentUsernames = items.filter((item) => {
      return !state.usernames.includes(item.login);
    });

    const api_res = await fetch(`${ENV_API_URL}/api/index`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filterCurrentUsernames),
    });
    const data = await api_res.json();

    dispatch({ type: "SET_USERS", payload: [...state.users, ...data] });
  };

  const setUsernames = ({ names, action }) => {
    let data = state.usernames;
    if (action === "REMOVE") {
      data = data.replace(` ${names}`, "");
      dispatch({ type: "SET_USERNAMES_REMOVE", payload: data });
    } else {
      if (typeof names === "object") {
        names.forEach(({ login }) => {
          if (!state.usernames.includes(login)) data += ` ${login}`;
        });
      } else {
        data += ` ${names}`;
      }
      dispatch({ type: "SET_USERNAMES_ADD", payload: data });
    }
  };

  const getUser = async (login) => {
    setLoading();
    const res = await fetch(`${GITHUB_URL}/users/${login}`);

    if (res.status === 404) {
      return (window.location = "/notfound");
    } else {
      const data = await res.json();
      dispatch({ type: "SET_USER", payload: data });
    }
  };

  const getUserRepos = async (login) => {
    setLoading();

    const params = new URLSearchParams({
      sort: "created",
      per_page: 10,
    });

    const res = await fetch(`${GITHUB_URL}/users/${login}/repos?${params}`);
    let data = await res.json();
    dispatch({ type: "SET_REPOS", payload: data });
  };

  const clearUsers = () => {
    dispatch({ type: "CLEAR_USERS", payload: [] });
  };

  const setLoading = () => {
    dispatch({ type: "SET_LOADING" });
  };

  const updateUserLocalStorage = (name, user) => {
    if (localStorage.getItem(`${name}`)) {
      localStorage.removeItem(name);
      setUsernames({ names: name, action: "REMOVE" });
    } else {
      const local_storage_save_time = Date.now();
      const watchlist = true;
      const localUser = { ...user, local_storage_save_time, watchlist };
      localStorage.setItem(name, JSON.stringify(localUser));
      setUsernames({ names: name, action: "ADD" });
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
        updateUserLocalStorage,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export default GithubContext;
