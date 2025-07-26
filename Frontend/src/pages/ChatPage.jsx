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

const ChatPage = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  // *** FIX ***
  // useSocket now returns an object, so we destructure the 'socket' instance
  // and the 'joinChatRoom' function we created earlier.
  const { socket, joinChatRoom } = useSocket();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    // Ensure all dependencies are available before proceeding.
    if (!socket || !friendId || !user?._id) return;

    // *** FIX ***
    // 1. Handlers are now registered ONCE in SocketProvider. We no longer register them here.
    // 2. We call the `joinChatRoom` function from our context to correctly join the chat room.
    joinChatRoom(friendId);

    // 3. We request the history for this chat.
    requestChatHistory(socket, friendId);

    // We define handler functions for our specific component's logic.
    const handleNewMessage = (msg) => {
      // Only add message to state if it belongs to this chat room.
      if (msg.sender === friendId || msg.receiver === friendId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleHistory = ({ messages: chatHistory, receiverId }) => {
      // Ensure the history is for the current friend.
      if (receiverId === friendId && Array.isArray(chatHistory)) {
        setMessages(chatHistory);
      }
    };

    // Listen for events.
    socket.on("direct-message", handleNewMessage);
    socket.on("direct-chat-history", handleHistory);

    // Cleanup: remove the listeners when the component unmounts or friendId changes.
    return () => {
      socket.off("direct-message", handleNewMessage);
      socket.off("direct-chat-history", handleHistory);
    };
  }, [socket, friendId, user, joinChatRoom]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle message send
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !socket) return;

    // *** FIX ***
    // The `senderId` is not needed as the backend gets it from the socket instance.
    // We also REMOVED the optimistic UI update. The message will now appear
    // only when the server broadcasts it back via the 'direct-message' event.
    // This ensures a single source of truth and prevents duplicate messages.
    sendMessage(socket, friendId, trimmed);
    setInput("");
  };

  // Start call
  const startCall = (type) => {
    if (!socket) return;
    // *** FIX ***
    // The `user._id` (callerId) is handled by the backend.
    // We also pass a flag to tell the CallPage that this user is the initiator.
    sendCallRequest(socket, friendId, type);
    navigate(`/call/${friendId}?type=${type}&initiator=true`);
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h2 className="text-lg font-semibold">VOXTREAM</h2>
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

        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {(messages || []).map((msg, idx) => (
            <MessageBubble key={msg._id || idx} msg={msg} isOwn={msg.sender === user._id} />
          ))}
          <div ref={scrollRef} />
        </div>

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
    </div>
  );
};

export default ChatPage;