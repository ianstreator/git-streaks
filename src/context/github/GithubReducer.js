const githubReducer = (state, action) => {
  switch (action.type) {
    case "SET_USERS":
      return {
        ...state,
        users: [...action.payload],
        loading: false,
      };
    case "SET_USERNAMES_ADD":
      return {
        ...state,
        usernames: action.payload,
        loading: false,
      };
    case "SET_USERNAMES_REMOVE":
      return {
        ...state,
        usernames: action.payload,
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
        loading: true,
      };

    default:
      return state;
  }
};

export default githubReducer;
