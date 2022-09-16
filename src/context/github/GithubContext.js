import { createContext, useReducer } from "react";
import githubReducer from "./GithubReducer";

const GithubContext = createContext();

const GITHUB_URL = process.env.REACT_APP_GITHUB_URL;

export const GithubProvider = ({ children }) => {
  const initialState = {
    users: [],
    user: {},
    repos: [],
    loading: false,
  };
  const [state, dispatch] = useReducer(githubReducer, initialState);

  const searchUsers = async (text) => {
    setLoading();

    const params = new URLSearchParams({
      q: text,
    });
    console.log(GITHUB_URL);
    console.log(params);
    console.log(`${GITHUB_URL}/search/users?${params}`);
    const res = await fetch(`${GITHUB_URL}/search/users?${params}`);
    console.log(res);
    if (res.status === 404) {
      return (window.location = "/notfound");
    } else {
      const { items } = await res.json();
      console.log(items);
      dispatch({ type: "GET_USERS", payload: items });
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
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export default GithubContext;
