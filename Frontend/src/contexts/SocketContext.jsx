import { createContext, useContext, useEffect, useRef } from "react";
import socket from "../sockets/socket";
import { emitNewConnection, registerConnectionHandlers } from "../sockets/connectionHandlers";
import { registerChatHandlers, joinChatRoom } from "../sockets/chatHandlers"; // <-- Import new function
import { registerCallHandlers } from "../sockets/callHandlers";

const SocketContext = createContext();

export const SocketProvider = ({ user, children }) => {
  const socketRef = useRef(socket);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const currentSocket = socketRef.current;

    if (!user) {
      console.warn("🔒 User not authenticated. Skipping socket connection.");
      return;
    }

    if (!isInitializedRef.current) {
      // ✅ Log successful connection
      currentSocket.on("connect", () => {
        console.log("✅ Socket connected:", currentSocket.id);
        emitNewConnection(currentSocket, user._id);
      });

      // ❌ Log connection errors
      currentSocket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
      });

      currentSocket.on("error", (err) => {
        console.error("⚠️ Socket error:", err);
      });


      // Register all handlers once
      registerChatHandlers(currentSocket, {
        onMessage: (msg) => console.log("💬 Message received:", msg),
        onHistory: (msgs) => console.log("📜 Chat history:", msgs),
      });

      registerCallHandlers(currentSocket, {
        onCallRequest: (data) => console.log("📞 Incoming call request:", data),
        onCallResponse: (res) => console.log("📲 Call response:", res),
        onUserLeft: () => console.log("👋 User left the call"),
        onRemoteStream: (stream) => {
          console.log("📺 Remote stream received", stream);
        },
      });
      
      registerConnectionHandlers(currentSocket, {
        onSocketConnected: (list) => console.log("🔌 Connected sockets:", list),
        onNotify: (data) => console.log("🔔 Notification:", data),
        onChatLeft: (data) => console.log("🚪 Chat left:", data),
        onDisconnect: () => console.log("❌ Socket disconnected"),
      });

      isInitializedRef.current = true;
    }

    currentSocket.connect();

    return () => {
      currentSocket.disconnect();
      isInitializedRef.current = false;
    };
  }, [user]);
  
  // Expose the socket instance and the new joinChatRoom function via context
  const contextValue = {
      socket: socketRef.current,
      joinChatRoom: (friendId) => joinChatRoom(socketRef.current, friendId),
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};


// Custom hook to provide easy access to socket and actions
export const useSocket = () => useContext(SocketContext);