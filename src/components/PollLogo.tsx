import React from "react";

const PollLogo: React.FC = () => {
  return (
    <div className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#5767D0] to-[#4F0DCE] text-white px-2 py-0.5 rounded-lg h-5 shadow-sm">
      <svg 
        width="10" 
        height="10" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <path 
          d="M20 14H14V20H20V14Z" 
          fill="currentColor" 
        />
        <path 
          d="M4 4H10V10H4V4Z" 
          fill="currentColor" 
        />
        <path 
          d="M14 4H20V10H14V4Z" 
          fill="currentColor" 
        />
        <path 
          d="M4 14H10V20H4V14Z" 
          fill="currentColor" 
          fillOpacity="0.4" 
        />
      </svg>
      <span className="font-medium text-[9px] tracking-wide leading-none whitespace-nowrap">Intervue Poll</span>
    </div>
  );
};

export default PollLogo;