import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePoll } from "@/context/PollContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PollLogo from "@/components/PollLogo";

const TeacherEntry: React.FC = () => {
  const { setUserName } = usePoll();
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!name.trim()) return;
    
    // Save user name in state and localStorage
    setUserName(name);
    localStorage.setItem("pollUserName", name);
    
    navigate("/teacher");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md text-center space-y-6">
        <PollLogo />
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Teacher Login</h1>
          <p className="text-gray-500">
            Enter your name to create and manage polls for your students.
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
              placeholder="John Smith"
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

export default TeacherEntry;