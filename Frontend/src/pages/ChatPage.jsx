import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import {
  registerChatHandlers,
  sendMessage,
  requestChatHistory,
} from "../sockets/chatHandlers";
import { sendCallRequest } from "../sockets/callHandlers";
import MessageBubble from "../components/Chat/MessageBubble";

const ChatPage = () => {
  const { friendId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef();

  // Register socket handlers and load chat history
  useEffect(() => {
    if (!socket || !friendId) return;

    registerChatHandlers(socket, {
      onMessage: (msg) => {
        if (msg.sender === friendId || msg.receiver === friendId) {
          setMessages((prev) => [...prev, msg]);
        }
      },
      onHistory: ({ messages }) => {
        setMessages(Array.isArray(messages) ? messages : []);
      },
    });

    requestChatHistory(socket, friendId);
  }, [socket, friendId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    sendMessage(socket, friendId, trimmed);

    setMessages((prev) => [
      ...prev,
      {
        sender: user._id,
        receiver: friendId,
        content: trimmed,
        createdAt: new Date(),
      },
    ]);

    setInput("");
  };

  const startCall = (type) => {
    sendCallRequest(socket, friendId, type);
    window.location.href = `/call/${friendId}?type=${type}`;
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h2 className="text-lg font-semibold">Chat with Friend</h2>
        <div className="space-x-2">
          <button
            onClick={() => startCall("audio")}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Audio Call
          </button>
          <button
            onClick={() => startCall("video")}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Video Call
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {Array.isArray(messages) && messages.map((msg, idx) => (
          <MessageBubble key={idx} msg={msg} isOwn={msg.sender === user._id} />
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
