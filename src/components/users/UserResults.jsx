import { useContext } from "react";
import Loader from "../layout/Loader";
import UserItem from "./UserItem";
import GithubContext from "../../context/github/GithubContext";

function UserResults() {
  const { users, loading } = useContext(GithubContext);
  const displayUsers = (
    <div className="grid grid-cols-1 gap-14 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2">
      {Object.values(users).map((user) => {
        return <UserItem key={user.login} user={user} />;
      })}
    </div>
  );

  if (!loading) {
    return <>{displayUsers}</>;
  } else {
    return (
      <>
        <div className="flex pb-8">
          {!loading.watchlist ? (
            <h1 className="text-4xl md:text-6xl">Fetching users</h1>
          ) : (
            <h1 className="text-4xl md:text-6xl">Updating watch list</h1>
          )}

          <Loader />
        </div>
        {displayUsers}
      </>
    );
  }
}

export default UserResults;
