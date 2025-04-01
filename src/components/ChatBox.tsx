import React, { useState, useRef, useEffect } from "react";
import { usePoll } from "@/context/PollContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: string;
}

type ChatBoxProps = {
  onClose?: () => void; // Close handler
};

const ChatBox: React.FC<ChatBoxProps> = ({ onClose }) => {
  const {
    messages,
    sendMessage,
    userName,
    participants,
    removeParticipant,
    role,
  } = usePoll();
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const handleSend = () => {
    if (newMessage.trim() === "") return;
    sendMessage(newMessage);
    setNewMessage("");
  };

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="border rounded-md shadow-lg h-[400px] flex flex-col bg-white">
      <div className="border-b p-3 flex justify-between items-center bg-gray-50">
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
              ${activeTab === "chat" 
                ? "bg-poll-primary text-white" 
                : "hover:bg-gray-200"}`}
            onClick={() => setActiveTab("chat")}
          >
            Chat
          </button>
          
          {role === "teacher" && (
            <button 
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                ${activeTab === "participants" 
                  ? "bg-poll-primary text-white" 
                  : "hover:bg-gray-200"}`}
              onClick={() => setActiveTab("participants")}
            >
              Participants ({participants.length})
            </button>
          )}
        </div>
        
        {onClose && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
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
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>

      {/* Chat Tab Content */}
      {activeTab === "chat" && (
        <>
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="text-gray-500 text-center py-6">
                No messages yet. Be the first to say hello!
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.sender === userName ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === userName
                          ? "bg-poll-primary text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {/* Always show sender name */}
                      <div className={`text-xs font-medium mb-1 ${
                        message.sender === userName ? "text-white/80" : "text-gray-500"
                      }`}>
                        {message.sender} • {formatTime(message.timestamp)}
                      </div>
                      
                      <div>{message.text}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                className="flex-1"
              />
              <Button onClick={handleSend} size="sm">
                Send
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Participants Tab Content */}
      {activeTab === "participants" && role === "teacher" && (
        <div className="flex-1 overflow-y-auto p-4">
          {participants.length === 0 ? (
            <div className="text-gray-500 text-center py-6">
              No participants have joined yet.
            </div>
          ) : (
            <div className="space-y-2">
              {participants.map((participant) => (
                <div 
                  key={participant._id}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{participant.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeParticipant(participant._id)}
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
                      <path d="M13 7v0" />
                      <path d="M19 11v0" />
                      <path d="M19 5v8h-7l-4 4v-4H5V5h14" />
                      <path d="m13 15 6 6" />
                      <path d="m19 15-6 6" />
                    </svg>
                    Kick
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBox;