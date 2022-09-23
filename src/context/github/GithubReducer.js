const githubReducer = (state, action) => {
  switch (action.type) {
    case "SET_USERS":
      return {
        ...state,
        users: action.payload,
        loading: false,
      };
    case "SET_WATCHLIST":
      return {
        ...state,
        watchlist: { ...action.payload },
        loading: false,
      };

    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        loading: false,
      };
    case "SET_REPOS":
      return {
        ...state,
        repos: action.payload,
        loading: false,
      };
    case "CLEAR_USERS":
      return {
        ...state,
        users: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
};

export default githubReducer;
