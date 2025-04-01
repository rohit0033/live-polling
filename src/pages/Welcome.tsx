
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePoll } from "@/context/PollContext";
import { Button } from "@/components/ui/button";
import PollLogo from "@/components/PollLogo";
import { Card, CardContent } from "@/components/ui/card";

const Welcome: React.FC = () => {
  const { setRole } = usePoll();
  const [selectedRole, setSelectedRole] = useState<"teacher" | "student" | null>(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedRole) return;
    
    setRole(selectedRole);
    
    if (selectedRole === "teacher") {
      navigate("/teacher-entry");
    } else {
      navigate("/student-entry");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-xl text-center space-y-6">
        <PollLogo />
        
        <div className="space-y-2">
          <h1 className="text-3xl font-normal">Welcome to the <span className="font-bold">Live Polling System</span></h1>
          <p className="text-gray-500">
            Please select the role that best describes you to begin using the live polling system
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className={`cursor-pointer transition-all hover:border-poll-primary hover:shadow-md ${
              selectedRole === "student" ? "border-poll-primary bg-poll-light/30" : ""
            }`}
            onClick={() => setSelectedRole("student")}
          >
            <CardContent className="p-6">
              <h3 className="font-bold text-lg">I'm a Student</h3>
              <p className="text-sm text-gray-500 mt-2">
                Submit answers and see how your responses compare with your classmates
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all hover:border-poll-primary hover:shadow-md ${
              selectedRole === "teacher" ? "border-poll-primary bg-poll-light/30" : ""
            }`}
            onClick={() => setSelectedRole("teacher")}
          >
            <CardContent className="p-6">
              <h3 className="font-bold text-lg">I'm a Teacher</h3>
              <p className="text-sm text-gray-500 mt-2">
                Submit answers and view live poll results in real-time
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Button 
          onClick={handleContinue}
          disabled={!selectedRole}
         className="w-full md:w-auto px-8 bg-gradient-to-r from-[#7765DA] to-[#5767D0] text-white hover:opacity-90 transition-opacity"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
