
import React, { useEffect, useState } from "react";

interface TimerProps {
  seconds: number | null;
}

const Timer: React.FC<TimerProps> = ({ seconds }) => {
  if (seconds === null) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 text-gray-700">
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span className={seconds < 10 ? "text-red-500" : ""}>
        {formatTime(seconds)}
      </span>
    </div>
  );
};

export default Timer;
