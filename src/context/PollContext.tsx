import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

// Types
export type UserRole = "teacher" | "student" | null;

export type PollOption = string;
export interface ChatMessage {
  sender: string;
  text: string;
  timestamp: string;
}

export type Poll = {
  _id: string;
  question: string;
  options: string[];
  responses: Record<string, number>;
  correctAnswers: string[];
  createdBy: string;
  status: "active" | "closed";
  maxTime: number;
  createdAt: string;
};


export type Participant = {
  _id: string;
  name: string;
  sessionId: string;
};

type PollContextType = {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  setUserName: (name: string) => void;
  currentPoll: Poll | null;
  setCurrentPoll: (poll: Poll | null) => void;
  selectedOption: string | null;
  setSelectedOption: (option: string | null) => void;
  hasSubmitted: boolean;
  setHasSubmitted: (hasSubmitted: boolean) => void;
  createPoll: (question: string, options: string[], maxTime: number, correctAnswers: string[]) => void;
  submitAnswer: (pollId: string, answer: string) => void;
  endPoll: (pollId: string) => void;
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
  participants: Participant[];
  removeParticipant: (participantId: string) => void;
  isConnected: boolean;
  pollHistory: Poll[];
  remainingTime: number | null;
  isWaiting: boolean;
  isKicked: boolean;
  sessionId: string;
  studentId: string | null;
  setStudentId: (id: string | null) => void;
  
};

const PollContext = createContext<PollContextType | undefined>(undefined);

// API URL and endpoints
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const PollProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState("");
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [pollHistory, setPollHistory] = useState<Poll[]>([]);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isKicked, setIsKicked] = useState(false);
  const [sessionId, setSessionId] = useState<string>(
    `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );
  const [studentId, setStudentId] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected with ID:", newSocket.id);
      console.log("Using socket URL:", SOCKET_URL);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Teacher creates a new poll
    socket.on("teacher:createPoll", (data: { poll: Poll }) => {
      console.log("Received new poll from teacher:", data.poll);
      setCurrentPoll(data.poll);
      setSelectedOption(null);
      setHasSubmitted(false);
      setIsWaiting(false);
      setRemainingTime(data.poll.maxTime);
    });

    // Poll results update
    // Add console logs to track the event flow
    socket.on(
      "poll:resultsUpdate",
      (data: { pollId: string; responses: Record<string, number> }) => {
        console.log("Received poll results update:", data);

        // Ensure the responses object is valid
        if (!data.responses || typeof data.responses !== "object") {
          console.error("Invalid responses object received:", data.responses);
          return;
        }

        setCurrentPoll((prev) => {
          if (!prev || prev._id !== data.pollId) {
            console.log("Poll ID mismatch or no current poll");
            return prev;
          }

          console.log("Updating poll responses:", data.responses);

          // Create a new poll object with updated responses
          return {
            ...prev,
            responses: { ...data.responses },
          };
        });
      }
    );

    // Poll ended
   // Inside the existing socket.on("poll:end") handler:
socket.on("poll:end", (data: { poll: Poll }) => {
  // Always add to poll history
  setPollHistory((prev) => {
    // Check if poll already exists in history
    const exists = prev.some(p => p._id === data.poll._id);
    if (exists) {
      // Replace with updated poll
      return prev.map(p => p._id === data.poll._id ? data.poll : p);
    }
    // Add to beginning of history
    return [data.poll, ...prev];
  });

  // Update current poll to show it's closed
  setCurrentPoll((prev) => (prev ? { ...prev, status: "closed" } : null));
  setRemainingTime(null);
  
  // For students, show results for longer (15 seconds) before clearing
  if (role === "student") {
    setTimeout(() => {
      setCurrentPoll(null);
      setIsWaiting(true);
    }, 15000); // 15 seconds instead of 5
  }
});

    // Poll timeout
    // Update your socket listeners to include the poll:timeout event:
    socket.on("poll:timeout", (data: { poll: Poll }) => {
      console.log("Poll timed out:", data);

      setCurrentPoll((prev) => {
        if (!prev || prev._id !== data.poll._id) return prev;

        // Mark the poll as ended
        return {
          ...data.poll,
          status: "closed",
        };
      });

      // Add the poll to history if it's not already there
      setPollHistory((prev) => {
        const exists = prev.some((p) => p._id === data.poll._id);
        if (exists) return prev;
        return [...prev, { ...data.poll, status: "closed" }];
      });

      // Reset the timer
      setRemainingTime(null);

      // If you're the teacher, alert that the poll has ended
      if (role === "teacher") {
        // Show a notification or play a sound
        const audio = new Audio("/notification-sound.mp3"); // Add a sound file to your public folder
        audio.play().catch((err) => console.log("Audio play failed:", err));

        // You could also use browser notifications if desired
        if (Notification.permission === "granted") {
          new Notification("Poll Ended", {
            body: "The poll has automatically ended due to the timer expiring.",
          });
        }
      }
    });

    // Chat message received
    socket.on("chat:message", (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    // Student joined
    socket.on(
      "student:join",
      (data: { student: { id: string; name: string } }) => {
        setParticipants((prev) => [
          ...prev.filter((p) => p._id !== data.student.id),
          { _id: data.student.id, name: data.student.name, sessionId },
        ]);
      }
    );

    // Student kicked
    socket.on("student:kick", (data: { studentId: string }) => {
      setParticipants((prev) => prev.filter((p) => p._id !== data.studentId));

      // If this is the current user
      if (role === "student" && data.studentId === studentId) {
        setIsKicked(true);
      }
    });

    // Timer countdown
    const interval = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime !== null && prevTime > 0) {
          return prevTime - 1;
        }
        return prevTime;
      });
    }, 1000);

    return () => {
      socket.off("teacher:createPoll");
      socket.off("poll:resultsUpdate");
      socket.off("poll:end");
      socket.off("poll:timeout");
      socket.off("chat:message");
      socket.off("student:join");
      socket.off("student:kick");
      clearInterval(interval);
    };
  }, [socket, remainingTime, role, studentId, sessionId]);

  // Load active poll when a user joins
  useEffect(() => {
    if (role && isConnected) {
      // Fetch active poll on initialization
      fetch(`${API_URL}/polls/active`)
        .then((res) => {
          if (!res.ok && res.status !== 404) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.success && data.data) {
            setCurrentPoll(data.data);
            setRemainingTime(data.data.maxTime);
            setIsWaiting(false);
          } else {
            // This is the expected case when no active poll exists
            console.log(
              "No active poll found, waiting for teacher to create one"
            );
            setCurrentPoll(null);
            setIsWaiting(true);
          }
        })
        .catch((err) => {
          console.error("Error fetching active poll:", err);
          setIsWaiting(true);
        });

      // If teacher, load poll history
      if (role === "teacher") {
        fetch(`${API_URL}/polls/history`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setPollHistory(data.data);
            }
          })
          .catch((err) => {
            console.error("Error fetching poll history:", err);
          });
      }
    }
  }, [role, isConnected]);

  // Methods
  const createPoll = async (
    question: string,
    options: string[],
    maxTime: number,
    correctAnswers: string[],
  ) => {
    if (!role || role !== "teacher") return;
  
    try {
      const url = `${API_URL}/polls/create`;
      const requestBody = {
        question,
        options,
        maxTime,
        correctAnswers,
        createdBy: userName,
      };
  
      console.log("Creating poll with:", requestBody);
  
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
  
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setCurrentPoll(data.data);
        setRemainingTime(data.data.maxTime);
        setIsWaiting(false);
        
        // Emit socket event
        if (socket) {
          socket.emit('teacher:createPoll', { poll: data.data });
        }
        
        return true;
      } else {
        console.error("Failed to create poll:", data.error);
        alert("Failed to create poll: " + (data.error || "Unknown error"));
        return false;
      }
    } catch (error) {
      console.error("Error creating poll:", error);
      alert("Error creating poll. Check console for details.");
      return false;
    }
  };

 const submitAnswer = async (pollId: string, answer: string) => {
  if (!studentId || !pollId) {
    console.error("Missing studentId or pollId:", { studentId, pollId });
    return;
  }

  try {
    console.log("Submitting answer:", { studentId, pollId, answer });

    const response = await fetch(`${API_URL}/students/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId,
        pollId,
        answer,
      }),
    });

    console.log("Response status:", response.status);
    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Error parsing response:", responseText);
      return;
    }

    console.log("Submit answer response:", data);

    if (data.success) {
      setHasSubmitted(true);
      setSelectedOption(answer);
    } else {
      console.error("Failed to submit answer:", data.error);
      alert("Failed to submit answer: " + (data.error || "Unknown error"));
      // Reset submission state
      setHasSubmitted(false);
    }
  } catch (error) {
    console.error("Error submitting answer:", error);
    // Reset submission state 
    setHasSubmitted(false);
  }
};
// Update the endPoll function to return a Promise
const endPoll = async (pollId: string): Promise<void> => {
  if (!role || role !== "teacher") return;

  try {
    const response = await fetch(`${API_URL}/polls/${pollId}/end`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      setCurrentPoll(data.data);
      if (socket) {
        socket.emit('poll:end', { pollId });
      }
    }
  } catch (error) {
    console.error("Error ending poll:", error);
    throw error;
  }
};
  // Update the sendMessage function
  const sendMessage = (text: string) => {
    if (!socket || !text.trim() || !userName) return;
    
    const message: ChatMessage = {
      sender: userName,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    
    console.log("Sending message:", message);
    
    // Emit the message via socket
    socket.emit('chat:message', message);
    
    // // Add the message to state immediately
    // setMessages(prev => [...prev, message]);
  };

  const removeParticipant = async (participantId: string) => {
    if (!role || role !== "teacher") return;

    try {
      const response = await fetch(
        `${API_URL}/students/kick/${participantId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        // The WebSocket event will handle UI updates
      }
    } catch (error) {
      console.error("Error removing participant:", error);
    }
  };

  // Register as a student
  useEffect(() => {
    if (role === "student" && userName && !studentId && isConnected) {
      // Register the student with the backend
      fetch(`${API_URL}/students/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName,
          sessionId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStudentId(data.data._id);
          }
        })
        .catch((err) => {
          console.error("Error joining as student:", err);
        });
    }
  }, [role, userName, sessionId, studentId, isConnected]);

  const value = {
    role,
    setRole,
    userName,
    setUserName,
    currentPoll,
    setCurrentPoll,
    selectedOption,
    setSelectedOption,
    hasSubmitted,
    setHasSubmitted,
    createPoll,
    submitAnswer,
    endPoll,
    messages,
    sendMessage,
    participants,
    removeParticipant,
    isConnected,
    pollHistory,
    remainingTime,
    isWaiting,
    isKicked,
    sessionId,
    studentId,
    setStudentId,
  };

  return <PollContext.Provider value={value}>{children}</PollContext.Provider>;
};

export const usePoll = () => {
  const context = useContext(PollContext);
  if (context === undefined) {
    throw new Error("usePoll must be used within a PollProvider");
  }
  return context;
};
