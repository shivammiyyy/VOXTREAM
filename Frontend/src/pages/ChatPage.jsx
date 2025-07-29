import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import {
  sendMessage,
  requestChatHistory,
} from "../sockets/chatHandlers";
import { sendCallRequest } from "../sockets/callHandlers";
import MessageBubble from "../components/Chat/MessageBubble";
import Navbar from "../components/Navbar";
import { Video, Phone } from "lucide-react";

const ChatPage = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    if (!socket || !friendId || !user?._id) return;

    socket.emit("join-room", { friendId });
    requestChatHistory(socket, friendId);

    const handleNewMessage = (msg) => {
      if (msg.sender === friendId || msg.receiver === friendId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleHistory = ({ messages: chatHistory, receiverId }) => {
      if (receiverId === friendId && Array.isArray(chatHistory)) {
        setMessages(chatHistory);
      }
    };

    socket.on("direct-message", handleNewMessage);
    socket.on("direct-chat-history", handleHistory);

    return () => {
      socket.off("direct-message", handleNewMessage);
      socket.off("direct-chat-history", handleHistory);
    };
  }, [socket, friendId, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !socket) return;

    sendMessage(socket, friendId, trimmed);
    setInput("");
  };

  const startCall = (type) => {
    if (!socket) return;
    sendCallRequest(socket, friendId, type);
    navigate(`/call/${friendId}?type=${type}&initiator=true`);
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      {/* Chat header */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white shadow-sm sticky top-0 z-10">
        <h2 className="text-xl font-semibold text-blue-700">VOXTREAM</h2>
        <div className="flex gap-4 text-blue-600">
          <Phone
            onClick={() => startCall("audio")}
            className="w-5 h-5 cursor-pointer hover:text-blue-800 transition"
          />
          <Video
            onClick={() => startCall("video")}
            className="w-5 h-5 cursor-pointer hover:text-blue-800 transition"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-100">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg._id || idx}
            msg={msg}
            isOwn={msg.sender === user._id}
          />
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t bg-white sticky bottom-0">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
