// src/components/CircularTimer.tsx
import React, { useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type Unit = "minutes" | "seconds";

export default function CircularTimer({ initialMinutes = 25 }: { initialMinutes?: number }) {
  // input state (string so user can type freely)
  const [inputValue, setInputValue] = useState<string>(String(initialMinutes));
  const [unit, setUnit] = useState<Unit>("minutes");

  // total and remaining time (seconds)
  const [totalSeconds, setTotalSeconds] = useState<number>(initialMinutes * 60);
  const remainingRef = useRef<number>(initialMinutes * 60);
  const [remaining, setRemaining] = useState<number>(initialMinutes * 60);

  // running state and RAF id
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  // convert input to seconds and apply
  const applyInput = () => {
    const n = Number(inputValue);
    if (!isFinite(n) || n <= 0) {
      // simple validation — you can show UI feedback here
      return;
    }
    const secs = unit === "minutes" ? Math.round(n * 60) : Math.round(n);
    setTotalSeconds(secs);
    remainingRef.current = secs;
    setRemaining(secs);
    stopTicker();
    setIsRunning(false);
  };

  // start the RAF loop
  const start = () => {
    if (remainingRef.current <= 0) return;
    setIsRunning(true);
    lastTimestampRef.current = performance.now();
    if (rafRef.current === null) tick();
  };

  const pause = () => {
    setIsRunning(false);
    stopTicker();
  };

  const reset = () => {
    stopTicker();
    remainingRef.current = totalSeconds;
    setRemaining(totalSeconds);
    setIsRunning(false);
  };

  const stopTicker = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTimestampRef.current = null;
  };

  // RAF-based tick to update remaining time smoothly (fractional seconds)
  const tick = () => {
    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = now;
        return;
      }
      const delta = (now - lastTimestampRef.current) / 1000; // seconds elapsed
      // update every small chunk (makes animation smooth)
      if (delta > 0) {
        lastTimestampRef.current = now;
        remainingRef.current = Math.max(0, remainingRef.current - delta);
        // show rounded-up seconds for better UX
        setRemaining(Math.ceil(remainingRef.current));

        if (remainingRef.current <= 0) {
          // finished
          stopTicker();
          setIsRunning(false);
          // optional: play sound or trigger callback here
        }
      }
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    // cleanup on unmount
    return () => stopTicker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // whenever totalSeconds changed externally, sync remaining if not running
  useEffect(() => {
    if (!isRunning) {
      remainingRef.current = totalSeconds;
      setRemaining(totalSeconds);
    }
  }, [totalSeconds, isRunning]);

  const percent = totalSeconds === 0 ? 0 : ((totalSeconds - remaining) / totalSeconds) * 100;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6">
      {/* Input row */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
        <input
          aria-label="Duration"
          className="w-36 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          inputMode="numeric"
        />

        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as Unit)}
          className="px-3 py-2 rounded-md border border-gray-200 bg-white"
        >
          <option value="minutes">Minutes</option>
          <option value="seconds">Seconds</option>
        </select>

        <button onClick={applyInput} className="px-4 py-2 rounded-md bg-indigo-600 text-white shadow hover:bg-indigo-700">
          Set
        </button>

        <button onClick={() => { setInputValue(""); setUnit("minutes"); }} className="px-3 py-2 rounded-md border border-gray-200 bg-white">
          Clear
        </button>
      </div>

      {/* Circular progress + time */}
      <div className="flex flex-col items-center space-y-6">
        <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          <CircularProgressbar
            value={percent}
            text={formatTime(remaining)}
            strokeWidth={8}
            styles={buildStyles({
              pathTransition: "none",
              trailColor: "#f3f4f6",
              strokeLinecap: "round",
              textColor: "#111827",
              pathColor: `rgba(79,70,229, ${Math.max(0.2, percent / 100)})`,
            })}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!isRunning && remaining > 0 && (
            <button onClick={start} className="px-5 py-2 rounded-md bg-green-600 text-white shadow hover:bg-green-700">
              Start
            </button>
          )}

          {isRunning && (
            <button onClick={pause} className="px-5 py-2 rounded-md bg-yellow-500 text-white shadow hover:bg-yellow-600">
              Pause
            </button>
          )}

          {!isRunning && remaining > 0 && remaining !== totalSeconds && (
            <button onClick={start} className="px-5 py-2 rounded-md bg-green-600 text-white shadow hover:bg-green-700">
              Resume
            </button>
          )}

          <button onClick={reset} className="px-5 py-2 rounded-md bg-red-600 text-white shadow hover:bg-red-700">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
