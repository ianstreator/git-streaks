import { useContext } from "react";
import Loader from "../layout/Loader";
import UserItem from "./UserItem";
import GithubContext from "../../context/github/GithubContext";

function UserResults() {
  const { users, loading } = useContext(GithubContext);
  if (!users) return;
  const displayUsers = (
    <div className="grid grid-cols-1 gap-14 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2">
      {Object.values(users).map((user, i) => (
        <UserItem key={i} user={user} />
      ))}
    </div>
  );

  if (!loading) {
    return <>{displayUsers}</>;
  } else {
    return (
      <div className="grow h-screen">
        <div className="flex pb-8">
          <h1 className="text-4xl md:text-6xl">Fetching users</h1>
          <Loader />
        </div>
        {displayUsers}
      </div>
    );
  }
}

export default UserResults;
