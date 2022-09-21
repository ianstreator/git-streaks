import { useState, useContext } from "react";
import GithubContext from "../../context/github/GithubContext";
import AlertContext from "../../context/alert/AlertContext";

function UserSearch() {
  const { setAlert } = useContext(AlertContext);
  const { users, searchUsers, clearUsers } = useContext(GithubContext);

  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (text === "") {
      setAlert("Try searching a github account name", "error");
    } else {
      searchUsers(text);
      setText("");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols2 lg:grid-cols2 md:grid-cols-2 mb-8 gap-8 ">
      <div className="">
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <div className="relative">
              <input
                type="text"
                className="w-full pr-40 bg-gray-200 input input-lg text-black"
                placeholder="Search"
                value={text}
                onChange={({ target: { value } }) => setText(value)}
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
      {users.length > 0 && (
        <div className="">
          <button className="btn btn-ghost btn-lg" onClick={clearUsers}>
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

export default UserSearch;
