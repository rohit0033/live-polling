import { useNavigate } from "react-router-dom";
import { usePoll } from "@/context/PollContext";
import { Button } from "@/components/ui/button";
import PollLogo from "@/components/PollLogo";
import PollOption from "@/components/PollOption";
import Timer from "@/components/Timer";
import ChatBox from "@/components/ChatBox";
import React, { useEffect, useState } from "react";
interface Poll {
  _id: string;
  question: string;
  options: string[];
  responses: Record<string, number>;
  correctAnswers: string[]; // Make sure this matches exactly
  createdBy: string;
  status: "active" | "closed";
  maxTime: number;
  createdAt: string;
}
const StudentPoll: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const {
    userName,
    currentPoll,
    selectedOption,
    setSelectedOption,
    hasSubmitted,
    submitAnswer,
    remainingTime,
    isWaiting,
    isKicked,
  } = usePoll();
  const navigate = useNavigate();

  // Redirect if no username set
  useEffect(() => {
    if (!userName) {
      navigate("/student-entry");
    }
  }, [userName, navigate]);

  // Redirect if kicked
  useEffect(() => {
    if (isKicked) {
      navigate("/kicked");
    }
  }, [isKicked, navigate]);

  const handleSelectOption = (optionText: string) => {
    if (hasSubmitted) return;
    console.log("Selected option:", optionText);

    
    
    if (selectedOption === optionText) {
    
      return;
    } else {
      
      setSelectedOption(optionText);
    }
  };
  const handleSubmit = () => {
    if (!currentPoll || selectedOption === null || hasSubmitted) {
      console.error("Cannot submit:", {
        currentPoll: !!currentPoll,
        selectedOption,
        hasSubmitted,
      });
      return;
    }

    console.log("Submitting answer:", {
      pollId: currentPoll._id,
      answer: selectedOption,
    });

    submitAnswer(currentPoll._id, selectedOption);
  };

  // For displaying results
  const calculatePercentage = (votes: number) => {
    if (!currentPoll) return 0;
    const totalVotes = Object.values(currentPoll.responses).reduce(
      (acc, val) => acc + val,
      0
    );
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };
  const toggleChat = () => {
    setShowChat((prev) => !prev);
  };
  const renderChatButton = () => (
    <div className="fixed bottom-6 right-6">
      <Button
        size="icon"
        variant="outline"
        className="h-12 w-12 rounded-full shadow-md bg-poll-primary text-white hover:bg-poll-primary/90"
        onClick={toggleChat}
      >
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
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </Button>
    </div>
  );
  // Update the renderChatBox function
  const renderChatBox = () =>
    showChat && (
      <div className="fixed bottom-24 right-6 w-96 z-50">
        <ChatBox onClose={() => setShowChat(false)} />
      </div>
    );
  if (isWaiting) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="p-4 border-b">
          <div className="max-w-5xl mx-auto">
            <PollLogo />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4 animate-fade-in">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poll-primary"></div>
            </div>
            <h1 className="text-2xl font-bold">
              Wait for the teacher to ask questions...
            </h1>
          </div>
        </main>

        {renderChatButton()}
        {renderChatBox()}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b">
        <div className="max-w-5xl mx-auto">
          <PollLogo />
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Question {currentPoll ? "1" : ""}
            </h2>
            {remainingTime !== null && <Timer seconds={remainingTime} />}
          </div>

          {currentPoll && (
            <div className="animate-fade-in">
              <div className="bg-gray-800 text-white p-4 rounded-t-md">
                <h3 className="text-xl">{currentPoll.question}</h3>
              </div>
              <div className="border border-t-0 rounded-b-md p-4 space-y-3">
                {hasSubmitted || currentPoll.status === "closed"
                  ? currentPoll.options.map((option, index) => {
                      const votes = currentPoll.responses[option] || 0;
                      const totalVotes = Object.values(
                        currentPoll.responses
                      ).reduce((sum, count) => sum + count, 0);
                      const isCorrect =
                        currentPoll.correctAnswers?.includes(option);

                      return (
                        <PollOption
                          key={index}
                          number={index + 1}
                          text={option}
                          percentage={calculatePercentage(votes)}
                          isSelected={selectedOption === option}
                          isCorrect={
                            currentPoll.status === "closed"
                              ? isCorrect
                              : undefined
                          }
                        />
                      );
                    })
                  : currentPoll.options.map((option, index) => (
                      <PollOption
                        key={index}
                        number={index + 1}
                        text={option}
                        isSelected={selectedOption === option}
                        onClick={() => handleSelectOption(option)}
                      />
                    ))}
              </div>

              {hasSubmitted &&
                currentPoll.correctAnswers &&
                currentPoll.status === "closed" && (
                  <div
                    className={`mt-4 p-4 rounded-md ${
                      currentPoll.correctAnswers.includes(selectedOption || "")
                        ? "bg-green-100 border border-green-200"
                        : "bg-red-100 border border-red-200"
                    }`}
                  >
                    <p
                      className={`text-center font-medium ${
                        currentPoll.correctAnswers.includes(
                          selectedOption || ""
                        )
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {currentPoll.correctAnswers.includes(selectedOption || "")
                        ? "Correct! Great job!"
                        : `Incorrect. The correct answer${
                            currentPoll.correctAnswers.length > 1
                              ? "s are"
                              : " is"
                          }: 
           ${currentPoll.correctAnswers.join(", ")}`}
                    </p>
                  </div>
                )}

              {!hasSubmitted && (
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    disabled={selectedOption === null}
                  >
                    Submit
                  </Button>
                </div>
              )}

              {hasSubmitted && (
                <div className="mt-6 text-center">
                  <p className="text-gray-500">
                    Wait for the teacher to ask a new question.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {renderChatButton()}
      {renderChatBox()}
    </div>
  );
};

export default StudentPoll;
