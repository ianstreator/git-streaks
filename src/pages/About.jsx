import React from "react";

function About() {
  const features = {
    streaks: `Track 🔎🐾 user's current and best streaks based on consecutive days of committing to GitHub.`,
    watchlist: `Create a list 📃 of users to monitor, conveniently stored in your browser's local storage. (Toggled by interacting with the "👀" icon on user cards.)`,
    profiles: `Access 🗝️ a concise overview of individual accounts, including general information and their 10 latest repositories.`,
  };
  return (
    <div className="m-4 mx-8">
      <h1 className="text-6xl mb-4">Git Streaks</h1>
      <p className="mb-4 text-2xl font-light">
        This React application allows users to view their own and their friends'
        daily GitHub contribution streaks, along with additional features.
      </p>
      <p className="mb-4 text-4xl">Features</p>

      {Object.entries(features).map(([feature, explanation]) => (
        <>
          <p className="text-2xl font-medium first-letter:uppercase">
            {feature}
          </p>
          <p className="mb-4 ml-4 text-2xl font-light">{explanation}</p>
        </>
      ))}
    </div>
  );
}

export default About;
