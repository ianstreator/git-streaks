import { useContext, useRef } from "react";
import GithubContext from "../../context/github/GithubContext";
import AlertContext from "../../context/alert/AlertContext";

function UserSearch() {
  const { setAlert } = useContext(AlertContext);
  const { users, searchUsers, clearUsers, watchlist } =
    useContext(GithubContext);

  const searchRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (searchRef.current.value === "") {
      setAlert("Try searching a GitHub account name", "error");
    } else {
      clearUsers();
      const searchRes = await searchUsers(searchRef.current.value);
      if (!searchRes)
        setAlert("There were no results based on that search...", "error");
      searchRef.current.value = "";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols2 lg:grid-cols3 md:grid-cols-2 mb-8 gap-8 ">
      <div className="">
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <div className="relative">
              <input
                type="text"
                className="w-full pr-40 bg-gray-200 input input-lg text-black"
                placeholder="Search Github User"
                ref={searchRef}
              />
              <button
                type="submit"
                className="absolute top-0 right-0 rounded-l-none rounded-r w-36 btn btn-lg"
              >
                Go
              </button>
            </div>
          </div>
        </form>
      </div>
      {Object.keys(watchlist).length !== Object.keys(users).length && (
        <button className="btn btn-ghost btn-lg" onClick={clearUsers}>
          Clear
        </button>
      )}
    </div>
  );
}

export default UserSearch;
