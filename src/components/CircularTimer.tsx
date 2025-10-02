import { useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type Unit = "hours" | "minutes" | "seconds";

export default function CircularTimer({ initialMinutes = 25 }: { initialMinutes?: number }) {
  const [inputValue, setInputValue] = useState<string>(String(initialMinutes));
  const [unit, setUnit] = useState<Unit>("minutes");
  const [totalSeconds, setTotalSeconds] = useState<number>(initialMinutes * 60);
  const remainingRef = useRef<number>(initialMinutes * 60);
  const [remaining, setRemaining] = useState<number>(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  const applyInput = () => {
    const n = Number(inputValue);
    if (!isFinite(n) || n <= 0) return;

    let secs = 0;
    if (unit === "hours") secs = Math.round(n * 3600);
    else if (unit === "minutes") secs = Math.round(n * 60);
    else secs = Math.round(n);

    setTotalSeconds(secs);
    remainingRef.current = secs;
    setRemaining(secs);
    stopTicker();
    setIsRunning(false);
  };

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

  const tick = () => {
    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = now;
        return;
      }
      const delta = (now - lastTimestampRef.current) / 1000;
      if (delta > 0) {
        lastTimestampRef.current = now;
        remainingRef.current = Math.max(0, remainingRef.current - delta);
        setRemaining(Math.ceil(remainingRef.current));
        if (remainingRef.current <= 0) {
          stopTicker();
          setIsRunning(false);
        }
      }
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => () => stopTicker(), []);
  useEffect(() => {
    if (!isRunning) {
      remainingRef.current = totalSeconds;
      setRemaining(totalSeconds);
    }
  }, [totalSeconds, isRunning]);

  const percent = totalSeconds === 0 ? 0 : ((totalSeconds - remaining) / totalSeconds) * 100;

  // format hh:mm:ss
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center animate-gradient bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-[length:200%_200%] text-white relative overflow-hidden">

      {/* Input section (top) */}
      <div className="absolute top-6 flex gap-2 items-center">
        <input
          className="w-28 px-3 py-2 rounded-md text-black focus:ring-2 focus:ring-indigo-400 outline-none"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          inputMode="numeric"
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as Unit)}
          className="px-2 py-2 rounded-md text-black"
        >
          <option value="hours">Hours</option>
          <option value="minutes">Minutes</option>
          <option value="seconds">Seconds</option>
        </select>
        <button
          onClick={applyInput}
          className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 shadow"
        >
          Set
        </button>
      </div>

      {/* Huge circular progress */}
      <div className="w-[80vw] max-w-[650px]">
        <CircularProgressbar
          value={percent}
          text={formatTime(remaining)}
          strokeWidth={6}
          styles={buildStyles({
            pathTransition: "none",
            trailColor: "rgba(255,255,255,0.15)",
            strokeLinecap: "round",
            textColor: "#fff",
            textSize: "18px",
            pathColor: `rgba(236,72,153, ${Math.max(0.25, percent / 100)})`,
          })}
        />
      </div>

      {/* Controls (bottom) */}
      <div className="absolute bottom-10 flex gap-4">
        {!isRunning && remaining > 0 && (
          <button
            onClick={start}
            className="px-6 py-2 rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
          >
            Start
          </button>
        )}

        {isRunning && (
          <button
            onClick={pause}
            className="px-6 py-2 rounded-full bg-yellow-500 hover:bg-yellow-600 shadow-lg"
          >
            Pause
          </button>
        )}

        {!isRunning && remaining > 0 && remaining !== totalSeconds && (
          <button
            onClick={start}
            className="px-6 py-2 rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
          >
            Resume
          </button>
        )}

        <button
          onClick={reset}
          className="px-6 py-2 rounded-full bg-red-500 hover:bg-red-600 shadow-lg"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
