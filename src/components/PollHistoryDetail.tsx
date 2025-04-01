import React from "react";
import { Poll } from "@/context/PollContext";
// import PollResults from "./PollResults";
import { Button } from "./ui/button";

interface PollHistoryDetailProps {
  poll: Poll;
  onClose: () => void;
}

const PollHistoryDetail: React.FC<PollHistoryDetailProps> = ({ poll, onClose }) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">Poll Details</h3>
          <button onClick={onClose} className="text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4 text-sm text-gray-500">
            <p>Created: {formatDate(poll.createdAt)}</p>
            <p>Total responses: {Object.values(poll.responses).reduce((sum, count) => sum + count, 0)}</p>
          </div>
          
          {/* <PollResults poll={poll} /> */}
          
          <div className="mt-6 flex justify-end">
            <Button onClick={onClose} variant="outline">Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollHistoryDetail;