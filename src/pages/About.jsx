import React from "react";

function About() {
  return (
    <div>
      <h1 className="text-6xl mb-4">Git-Streaks</h1>
      <p className="mb-4 text-2xl font-light">
        {
          "A React app to view GitHub account contribution data ( current-streak, best-streak, yearly contributions ), and further profile details."
        }
      </p>
      <p className="text-lg text-gray-400">
        Layout By:
        <a
          className="text-white"
          target="_blank"
          href="https://twitter.com/hassibmoddasser"
        >
          &nbsp;Hassib Moddasser
        </a>
      </p>
    </div>
  );
}

export default About;
