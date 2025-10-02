// src/App.tsx
import React from "react";
import CircularTimer from "./components/CircularTimer";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-4">Productivity Timer</h1>
      <p className="text-sm text-gray-600 mb-6">Enter duration, start the timer and stay focused ✨</p>
      <CircularTimer initialMinutes={25} />
      {/* <footer className="mt-8 text-xs text-gray-500">
        Built with React, TypeScript, Tailwind & react-circular-progressbar
      </footer> */}
    </div>
  );
}

export default App;
