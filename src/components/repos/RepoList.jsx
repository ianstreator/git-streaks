import PropTypes from "prop-types";
import RepoItem from "./RepoItem";

function RepoList({ repos }) {
  return (
    <div className="rounded-lg shadow-lg card bg-base-100 p-4">
      <h2 className="text-3xl my-4 mr-auto font-bold card card-title">
        Latest Repositories
      </h2>
      {repos.map((repo) => {
        return <RepoItem key={repo.id} repo={repo} />;
      })}
    </div>
  );
}

RepoList.propTypes = {
  repos: PropTypes.array.isRequired,
};

export default RepoList;
