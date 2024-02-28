import { createContext, useEffect, useReducer } from "react";
import githubReducer from "./GithubReducer";

const GithubContext = createContext();

const GITHUB_URL = process.env.REACT_APP_GITHUB_URL;
const isdev = window.location.href.includes("localhost");
const ENV_API_URL = isdev
  ? process.env.REACT_APP_DEV_API_URL
  : process.env.REACT_APP_PROD_API_URL;
const LOCAL_STORAGE_KEY = "watchlist";

const localStorageWatchList = JSON.parse(
  localStorage.getItem(LOCAL_STORAGE_KEY)
);

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
    if (!localStorageWatchList) return;
    dispatch({ type: "SET_WATCHLIST", payload: { ...localStorageWatchList } });
    dispatch({
      type: "SET_USERS",
      payload: {
        ...localStorageWatchList,
      },
    });
    updateWatchList();
  }, []);

  const updateWatchList = async () => {
    const promises = Object.values(localStorageWatchList).map(
      async (userData) => {
        const saveTime = new Date(userData.saveTime);
        const currTime = new Date();
        const seconds = 1000;
        const minutes = 60 * seconds;
        const hours = 60 * minutes;

        if (currTime - saveTime > 2 * hours) {
          try {
            localStorageWatchList[userData.login] = {
              ...userData,
              updating: true,
            };
            dispatch({
              type: "SET_USERS",
              payload: {
                ...localStorageWatchList,
              },
            });

            await updateWatchListUser(userData);
          } catch (error) {
            console.log(error);
          }
        }
      }
    );

    await Promise.allSettled(promises);
  };

  const updateWatchListUser = async (user) => {
    const username = user.login;

    let updatedWatchList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

    const data = await getUsersContributionData([username]);

    const updatedUser = {
      ...user,
      saveTime: Date.now(),
      userContributionData: { ...data[username] },
      updating: false,
    };

    dispatch({
      type: "SET_USERS",
      payload: {
        ...updatedWatchList,
        [username]: { ...updatedUser },
      },
    });

    dispatch({
      type: "SET_WATCHLIST",
      payload: {
        ...updatedWatchList,
        [username]: { ...updatedUser },
      },
    });

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(
        updatedWatchList,
        (updatedWatchList[username] = {
          ...updatedUser,
        })
      )
    );
  };

  const searchUsers = async (text) => {
    setLoading(true);
    const params = new URLSearchParams(`q=${text}+type:user`);

    const githubUsersObject = {};
    const res = await fetch(`${GITHUB_URL}/search/users?${params}`);
    const { items: users } = await res.json();
    users.forEach((user) => {
      githubUsersObject[user.login] = user;
    });

    if (!users.length) {
      setLoading(false);
      return undefined;
    }

    const filterCurrentUsernames = users
      .filter((user) => !state.watchlist[user.login])
      .map((user) => user.login);
    if (!filterCurrentUsernames.length) return setLoading({ data: false });
    const contributionData = await getUsersContributionData(
      filterCurrentUsernames
    );

    Object.entries(contributionData).forEach(([user, data]) => {
      githubUsersObject[user] = {
        ...githubUsersObject[user],
        userContributionData: data,
      };
    });

    dispatch({
      type: "SET_USERS",
      payload: { ...state.watchlist, ...githubUsersObject },
    });
    setLoading(false);
    return true;
  };

  const getUsersContributionData = async (users) => {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(users),
    };
    const res = await fetch(`${ENV_API_URL}/api/index`, options);
    console.log(res)
    const data = await res.json();
    console.log(data)
    if (res.status === 200) {
      return data;
    } else {
      console.log(res.status, data);
    }
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

  const addToWatchList = (user) => {
    const username = user.login;

    const updatedWatchList = {
      ...state.watchlist,
      [username]: { ...user, saveTime: Date.now(), updating: false },
    };

    dispatch({
      type: "SET_WATCHLIST",
      payload: { ...updatedWatchList },
    });

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ ...updatedWatchList })
    );
  };

  const removeFromWatchList = (user) => {
    const username = user.login;

    const watchListRef = { ...state.watchlist };
    delete watchListRef[username];

    dispatch({ type: "SET_WATCHLIST", payload: { ...watchListRef } });

    if (!Object.keys(watchListRef).length) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } else {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ ...watchListRef })
      );
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
        addToWatchList,
        removeFromWatchList,
        updateWatchList,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export default GithubContext;
