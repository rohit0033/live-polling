
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePoll } from "@/context/PollContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PollLogo from "@/components/PollLogo";

const StudentEntry: React.FC = () => {
  const { setUserName } = usePoll();
  const [name, setName] = useState("");
  const navigate = useNavigate();
  

  const handleContinue = () => {
    if (!name.trim()) return;
    
    // Save user name in state and localStorage
    setUserName(name);
    localStorage.setItem("pollUserName", name);
    
    navigate("/student-poll");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md text-center space-y-6">
        <PollLogo />
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Let's Get Started</h1>
          <p className="text-gray-500">
            If you're a student, you'll be able to 
            <strong className="text-poll-primary"> submit your answers</strong>, 
            participate in live polls, and see how your responses compare with your classmates
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="text-left">
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Enter your Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Rahul Bajaj"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleContinue}
            disabled={!name.trim()}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentEntry;
