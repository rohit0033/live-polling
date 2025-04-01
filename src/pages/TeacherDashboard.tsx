import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePoll } from "@/context/PollContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PollLogo from "@/components/PollLogo";
import PollOption from "@/components/PollOption";
import Timer from "@/components/Timer";
import ChatBox from "@/components/ChatBox";

// Define the Poll type if it's not available from context
interface Poll {
  _id: string;
  question: string;
  options: string[];
  responses: Record<string, number>;
  createdBy: string;
  correctAnswers: string[];
  status: "active" | "closed";
  maxTime: number;
  createdAt: string;
}
interface PollOptionProps {
  number: number;
  text: string;
  percentage: number;
  isSelected?: boolean;
  votes?: number; // Add this prop
  isCorrect?: boolean;
}

const TeacherDashboard: React.FC = () => {
  const {
    role,
    currentPoll,
    userName,
    setUserName,
    createPoll,
    remainingTime,
    endPoll,
    pollHistory,
    setCurrentPoll,
  } = usePoll();
  const navigate = useNavigate();

  const [selectedHistoryPoll, setSelectedHistoryPoll] = useState<Poll | null>(
    null
  );
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [duration, setDuration] = useState(60);
  const [showPollHistory, setShowPollHistory] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  // Format date for better display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  // Redirect if not a teacher
  useEffect(() => {
    if (role !== "teacher") {
      navigate("/");
      return;
    }

    if (!userName) {
      const savedName = localStorage.getItem("pollUserName");
      if (savedName) {
        setUserName(savedName);
      } else {
        const teacherName = prompt(
          "Please enter your name to continue as teacher:"
        );
        if (teacherName) {
          setUserName(teacherName);
          localStorage.setItem("pollUserName", teacherName);
        } else {
          navigate("/"); // Navigate back if no name provided
        }
      }
    }
  }, [role, userName, setUserName, navigate]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePoll = async () => {
    try {
      setIsSubmitting(true);

      // Filter out empty options
      const validOptions = options.filter((opt) => opt.trim() !== "");

      if (question.trim() === "" || validOptions.length < 2) {
        alert("Please enter a question and at least two options");
        return;
      }

      // Validate at least one correct answer
      if (correctAnswers.length === 0) {
        alert("Please mark at least one option as correct");
        return;
      }

      // Filter correctAnswers to only include valid options
      const validCorrectAnswers = correctAnswers.filter((answer) =>
        validOptions.includes(answer)
      );

      await createPoll(question, validOptions, duration, validCorrectAnswers);

      // Proceed with form reset after successful poll creation
      {
        // Reset form
        setQuestion("");
        setOptions(["", ""]);
        setCorrectAnswers([]);
        setShowPollHistory(false);
      }
    } catch (error) {
      console.error("Error in handleCreatePoll:", error);
      alert("Failed to create poll. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // For displaying results
  const calculatePercentage = (votes: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  // Render poll history detail modal
  const renderPollHistoryDetail = () => {
    if (!selectedHistoryPoll) return null;

    const totalVotes = Object.values(selectedHistoryPoll.responses).reduce(
      (sum, count) => sum + count,
      0
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
          <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <h3 className="text-xl font-bold">Poll Details</h3>
            <button
              onClick={() => setSelectedHistoryPoll(null)}
              className="text-white"
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
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="p-6">
            <div className="mb-4 grid grid-cols-2 gap-2 text-sm text-gray-500">
              <p>
                Created:{" "}
                <span className="font-semibold">
                  {formatDate(selectedHistoryPoll.createdAt)}
                </span>
              </p>
              <p>
                Status:{" "}
                <span className="font-semibold">
                  {selectedHistoryPoll.status}
                </span>
              </p>
              <p>
                Total votes: <span className="font-semibold">{totalVotes}</span>
              </p>
              <p>
                Duration:{" "}
                <span className="font-semibold">
                  {selectedHistoryPoll.maxTime} seconds
                </span>
              </p>
            </div>

            <div className="bg-gray-100 rounded p-4 mb-4">
              <h4 className="font-medium mb-2">Question</h4>
              <div className="bg-gray-800 text-white p-4 rounded-md">
                <h3 className="text-xl">{selectedHistoryPoll.question}</h3>
              </div>
            </div>

            <div className="space-y-3">
              {selectedHistoryPoll.options.map((option, i) => {
                const votes = selectedHistoryPoll.responses[option] || 0;

                return (
                  <PollOption
                    key={i}
                    number={i + 1}
                    text={option}
                    percentage={calculatePercentage(votes, totalVotes)}
                    votes={votes}
                  />
                );
              })}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                onClick={() => setSelectedHistoryPoll(null)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <PollLogo />

          {!showPollHistory && !currentPoll && (
            <Button
              variant="outline"
              onClick={() => setShowPollHistory(true)}
              className="flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0Z"></path>
                <path d="M12 12h.01"></path>
                <path d="M11 17v1"></path>
                <path d="M11 10V6"></path>
              </svg>
              View Poll history
            </Button>
          )}

          {(showPollHistory || currentPoll) && (
            <Button
              variant="outline"
              onClick={async () => {
                setShowPollHistory(false);

                try {
                  if (currentPoll && currentPoll.status === "active") {
                    await endPoll(currentPoll._id);
                  }
                  // Clear current poll state to show the create form
                  setCurrentPoll(null);
                  // Reset form fields for a fresh start
                  setQuestion("");
                  setOptions(["", ""]);
                  setCorrectAnswers([]);
                } catch (error) {
                  console.error("Error ending poll:", error);
                  alert("Failed to end poll. Please try again.");
                }
              }}
              className="flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Ask new question
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-5xl mx-auto">
          {showPollHistory ? (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">View Poll History</h2>

              {pollHistory.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No poll history yet. Create your first poll to get started.
                </div>
              ) : (
                <div className="space-y-8">
                  {pollHistory.map((poll, index) => (
                    <div
                      key={poll._id}
                      className="border rounded-md overflow-hidden cursor-pointer hover:border-poll-primary transition-colors"
                      onClick={() => setSelectedHistoryPoll(poll)}
                    >
                      <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
                        <h3 className="font-medium">Question {index + 1}</h3>
                        <span className="text-xs text-gray-500">
                          {formatDate(poll.createdAt)}
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="bg-gray-800 text-white p-4 rounded-t-md">
                          <h3 className="text-xl">{poll.question}</h3>
                        </div>

                        <div className="border border-t-0 rounded-b-md p-4">
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>
                              {Object.values(poll.responses).reduce(
                                (sum, count) => sum + count,
                                0
                              )}{" "}
                              responses
                            </span>
                            <span>Click to view details</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : currentPoll ? (
            <div className="animate-fade-in">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-bold">Question</h2>
                <div className="flex items-center gap-4">
                  {remainingTime !== null && <Timer seconds={remainingTime} />}
                  <Button
                    variant="destructive"
                    onClick={() => currentPoll && endPoll(currentPoll._id)}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M9 9h6v6H9z" />
                    </svg>
                    End Poll
                  </Button>
                </div>
              </div>

              <div className="bg-gray-800 text-white p-4 rounded-t-md">
                <h3 className="text-xl">{currentPoll.question}</h3>
              </div>

              <div className="border border-t-0 rounded-b-md p-4 space-y-3">
                {currentPoll.options.map((option, i) => {
                  // Calculate votes for this option
                  const votes = currentPoll.responses[option] || 0;
                  // Calculate total votes
                  const totalVotes = Object.values(
                    currentPoll.responses
                  ).reduce((sum, count) => sum + count, 0);
                  const isCorrect =
                    currentPoll.correctAnswers?.includes(option);

                  return (
                    <PollOption
                      key={i}
                      number={i + 1}
                      text={option}
                      percentage={calculatePercentage(votes, totalVotes)}
                      votes={votes}
                      isCorrect={
                        currentPoll.status === "closed" ? isCorrect : undefined
                      }
                    />
                  );
                })}
              </div>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  {showChat ? (
                    <ChatBox onClose={() => setShowChat(false)} />
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowChat(true)}
                      className="flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                        <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                      </svg>
                      Open Chat
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <h2 className="text-2xl mb-6">
                Let's <span className="font-bold">Get Started</span>
              </h2>
              <p className="text-gray-500 mb-8">
                You'll have the ability to create and manage polls, ask
                questions, and monitor your students' responses in real-time.
              </p>

              <Card className="shadow-sm border-none">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Enter your question
                      </label>
                      <Textarea
                        placeholder="Which planet is known as the Red Planet?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="bg-[#F2F2F2] text-black placeholder:black/60 min-h-[100px] max-w-3xl"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium mb-1">
                          Edit Options
                        </label>
                        <div className="min-w-[400px]">
                          <label className="block text-sm font-medium mb-1 text-left">
                          Is it correct?
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-poll-primary text-xs font-medium text-white">
                              {index + 1}
                            </div>
                            <Input
                              value={option}
                              onChange={(e) =>
                                handleOptionChange(index, e.target.value)
                              }
                              placeholder={`Option ${index + 1}`}
                              className="flex-1 max-w-lg bg-[#F2F2F2] text-black placeholder:black/60"
                            />

                            {/* Radio buttons section WITHOUT the label (moved to header) */}
                            <div className="flex items-center justify-center gap-4 min-w-[150px]">
                              <label className="flex items-center gap-1">
                                <input
                                  type="radio"
                                  name={`correct-${index}`}
                                  value="yes"
                                  checked={correctAnswers.includes(option)}
                                  onChange={() => {
                                    if (option.trim()) {
                                      if (correctAnswers.includes(option)) {
                                        // Remove if already selected
                                        setCorrectAnswers((prev) =>
                                          prev.filter((ans) => ans !== option)
                                        );
                                      } else {
                                        // Add to correct answers
                                        setCorrectAnswers((prev) => [
                                          ...prev,
                                          option,
                                        ]);
                                      }
                                    }
                                  }}
                                  className="accent-[#7765DA]"
                                />
                                <span className="text-sm font-bold">Yes</span>
                              </label>
                              <label className="flex items-center gap-1">
                                <input
                                  type="radio"
                                  name={`correct-${index}`}
                                  value="no"
                                  checked={!correctAnswers.includes(option)}
                                  onChange={() => {
                                    if (option.trim()) {
                                      // Remove from correct answers if it exists
                                      setCorrectAnswers((prev) =>
                                        prev.filter((ans) => ans !== option)
                                      );
                                    }
                                  }}
                                  className="accent-[#7765DA]"
                                />
                                <span className="text-sm font-bold">No</span>
                              </label>
                            </div>

                            {/* Delete option button */}
                            {options.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(index)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      {options.length < 6 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addOption}
                          className="mt-3 text-poll-primary border-poll-primary hover:bg-poll-light/30"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1"
                          >
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          Add More Option
                        </Button>
                      )}
                    
                    </div>
                    

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Timer
                      </label>

                      <div className="flex items-center gap-2 max-w-xs">
                        <Input
                          type="number"
                          min="5"
                          max="300"
                          value={duration}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              setDuration(0);
                            } else {
                              const numValue = parseInt(value);
                              if (!isNaN(numValue)) {
                                setDuration(numValue);
                              }
                            }
                          }}
                          onBlur={() => {
                            if (duration < 5) setDuration(5);
                            if (duration > 300) setDuration(300);
                          }}
                          className="w-24"
                        />
                        <span className="text-black-500">seconds</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      onClick={handleCreatePoll}
                      disabled={
                        isSubmitting ||
                        question.trim() === "" ||
                        options.filter((opt) => opt.trim() !== "").length < 2 ||
                        correctAnswers.length === 0
                      }
                    >
                      {isSubmitting ? "Creating..." : "Ask Question"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Render poll detail modal when a poll is selected */}
      {selectedHistoryPoll && renderPollHistoryDetail()}
    </div>
  );
};

export default TeacherDashboard;
