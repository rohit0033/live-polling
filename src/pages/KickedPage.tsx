
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PollLogo from "@/components/PollLogo";

const KickedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md text-center space-y-6">
        <PollLogo />
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">You've been Kicked out!</h1>
          <p className="text-gray-500">
            Looks like the teacher had removed you from the poll system. Please
            try again sometime.
          </p>
        </div>
        
        <Button onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default KickedPage;
