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
    users: [],
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
    dispatch({ type: "GET_USERS", payload: savedUsers });
  }, []);

  const searchUsers = async (text) => {
    setLoading();
    const params = new URLSearchParams({
      q: text,
    });
    const res = await fetch(`${GITHUB_URL}/search/users?${params}`);
    if (res.status === 404) {
      return (window.location = "/notfound");
    } else {
      const { items } = await res.json();

      const api_res = await fetch(`${ENV_API_URL}/api/index`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items),
      });
      const data = await api_res.json();

      dispatch({ type: "GET_USERS", payload: data });
    }
  };

  const getUser = async (login) => {
    setLoading();
    const res = await fetch(`${GITHUB_URL}/users/${login}`);

    if (res.status === 404) {
      return (window.location = "/notfound");
    } else {
      const data = await res.json();
      dispatch({ type: "GET_USER", payload: data });
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
    dispatch({ type: "GET_REPOS", payload: data });
  };

  const updateUserLocalStorage = (name, user) => {
    if (localStorage.getItem(`${name}`)) {
      localStorage.removeItem(name);
    } else {
      const local_storage_save_time = Date.now();
      const watchlist = true;
      const localUser = { ...user, local_storage_save_time, watchlist };
      localStorage.setItem(name, JSON.stringify(localUser));
    }
  };

  const clearUsers = () => {
    dispatch({ type: "CLEAR_USERS", payload: [] });
  };

  const setLoading = () => {
    dispatch({ type: "SET_LOADING" });
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
