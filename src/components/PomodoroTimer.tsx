import React, { useState, useEffect, useRef } from "react";

type Mode = "focus" | "short" | "long";

export default function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("focus");
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // default 25 min
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number  | null>(null);

  // Mode presets
  const presets: Record<Mode, number> = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
  };

  // Format hh:mm:ss
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
      s
    ).padStart(2, "0")}`;
  };

  const start = () => {
    if (isRunning) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(intervalRef.current!);
          setIsRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const pause = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  const reset = (newMode: Mode = mode) => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setMode(newMode);
    setTimeLeft(presets[newMode]);
    setIsRunning(false);
  };

  return (
    <div
      className="h-screen w-screen bg-[url('/bg.jpg')] bg-cover bg-center flex items-center justify-center"
    >
      {/* Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center text-white">
        
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-6">
          {(["focus", "short", "long"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => reset(m)}
              className={`px-3 py-1 rounded-md text-sm ${
                mode === m ? "bg-indigo-500 text-white" : "bg-white/20"
              }`}
            >
              {m === "focus" ? "Focus" : m === "short" ? "Short Break" : "Long Break"}
            </button>
          ))}
        </div>

        {/* Timer */}
        <div className="font-mono text-6xl font-bold mb-4">
          {formatTime(timeLeft)}
        </div>

        {/* Optional title input */}
        <input
          type="text"
          placeholder="Click to add focus title"
          className="w-full px-3 py-2 mb-4 rounded-md bg-white/20 text-white placeholder-gray-300 text-center focus:outline-none"
        />

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {!isRunning ? (
            <button
              onClick={start}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg shadow-md"
            >
              Start
            </button>
          ) : (
            <button
              onClick={pause}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-md"
            >
              Pause
            </button>
          )}
          <button
            onClick={() => reset(mode)}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg shadow-md"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
