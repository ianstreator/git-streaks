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
    const res = await fetch(`${GITHUB_URL}/search/users?${params}`);
    if (res.status === 404) {
      return (window.location = "/notfound");
    } else {
      const { items } = await res.json();
      console.log(items);

      const api_res = await fetch(
        "https://git-streaks-api.vercel.app/api/index",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(items),
        }
      );
      const data = await api_res.json();
      console.log(data)

      dispatch({ type: "GET_USERS", payload: data });
    }
  };
  const getUserContributionData = async (login) => {
    const url = "https://api.github.com/graphql";

    const github_data = {
      token: "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",
      username: login,
    };
    const body = {
      query: `
      query MyQuery {
        user(login: "${login}") {
          contributionsCollection {
            contributionCalendar {
              weeks {
                contributionDays {
                  contributionCount
                }
              }
              totalContributions
            }
          }
        }
      }
    `,
    };
    const headers = {
      "Content-Type": "application/json",
      Authorization: "bearer " + github_data.token,
    };
    const options = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    };

    try {
      const res = await fetch(url, options);
      const { data } = await res.json();
      const dailyContributionList = [];
      const yearlyContributions =
        data.user.contributionsCollection.contributionCalendar
          .totalContributions;
      const weeklyContributionList =
        data.user.contributionsCollection.contributionCalendar.weeks;
      //...condense nested object values into integer array
      Object.values(weeklyContributionList).forEach((week) =>
        week.contributionDays.forEach((day) =>
          dailyContributionList.push(day.contributionCount)
        )
      );
      let currentStreak = 0;
      let bestStreak = 0;
      for (let i = 0; i < dailyContributionList.length; i++) {
        dailyContributionList[i - 1] > 0
          ? currentStreak++
          : (currentStreak = 0);
        if (currentStreak > bestStreak) bestStreak = currentStreak;
      }
      const contributionData = {
        currentStreak,
        bestStreak,
        yearlyContributions,
      };
      return contributionData;
    } catch (error) {
      console.log(error);
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
