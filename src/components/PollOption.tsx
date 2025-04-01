import React from 'react';

type PollOptionProps = {
  number: number;
  text: string;
  percentage?: number;
  isSelected?: boolean;
  votes?: number;
  onClick?: () => void;
  isCorrect?: boolean | null;
  showCorrectness?: boolean;
};

const PollOption: React.FC<PollOptionProps> = ({ 
  number, 
  text, 
  percentage = 0, 
  isSelected = false,
  votes,
  onClick,
  isCorrect,
  showCorrectness = false
}) => {
  const isClickable = typeof onClick === 'function';
  
  // Determine colors based on state
  const getBarBackgroundColor = () => {
    if (showCorrectness && isCorrect) return 'bg-green-600';
    if (showCorrectness && isCorrect === false) return 'bg-red-600';
    return 'bg-[#7765DA]'; // Use the exact hex color value
  };
  
  return (
    <div 
      className={`relative w-full p-3 rounded-md transition-all duration-300 overflow-hidden
        ${isClickable ? 'cursor-pointer hover:opacity-95' : ''}
        ${isSelected ? 'border-2 border-[#7765DA]' : 'border border-gray-200'}`}
      onClick={onClick}
    >
      {/* Background bar that shows the percentage */}
      <div 
        className={`absolute left-0 top-0 h-full ${getBarBackgroundColor()} transition-all duration-500`}
        style={{ 
          width: `${percentage || 0}%`,
          opacity: 1 // Full opacity for strong color
        }}
      />

      <div className="relative flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full
            ${percentage > 0 ? 'bg-white text-[#7765DA]' : 'bg-gray-200 text-gray-600'}
            ${showCorrectness && isCorrect ? 'bg-white text-green-600' : ''}
            ${showCorrectness && isCorrect === false ? 'bg-white text-red-600' : ''}
            font-medium text-sm transition-colors shadow-sm`}
          >
            {number}
          </div>
          <span className={`font-medium ${
            percentage > 20 ? 'text-white' : 'text-gray-700'
          }`}>
            {text}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {votes !== undefined && (
            <span className={`text-sm font-medium ${
              percentage > 20 ? 'text-white' : 'text-gray-500'
            }`}>
              {votes} votes
            </span>
          )}
          {percentage !== undefined && (
            <span className={`text-sm font-medium ${
              percentage > 20 ? 'text-white' : 'text-gray-500'
            }`}>
              {percentage}%
            </span>
          )}
          {showCorrectness && isCorrect !== null && (
            <span className={`flex items-center text-sm font-medium 
              ${percentage > 20 ? 'text-white' : (isCorrect ? 'text-green-500' : 'text-red-500')}`}
            >
              {isCorrect ? '✓' : '✗'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollOption;