import { createContext, useContext, useEffect, useRef } from "react";
import socket from "../sockets/socket";
import { emitNewConnection, registerConnectionHandlers } from "../sockets/connectionHandlers";
import { registerChatHandlers } from "../sockets/chatHandlers";
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

      // 📩 Register chat events
      registerChatHandlers(currentSocket, {
        onMessage: (msg) => console.log("💬 Message received:", msg),
        onHistory: (msgs) => console.log("📜 Chat history:", msgs),
      });

      // 📞 Register call events
      registerCallHandlers(currentSocket, {
        onCallRequest: (data) => console.log("📞 Incoming call request:", data),
        onCallResponse: (res) => console.log("📲 Call response:", res),
        onUserLeft: () => console.log("👋 User left the call"),
        onRemoteStream: (stream) => {
          console.log("📺 Remote stream received", stream);
        },
      });

      // 🧩 Register other events (connection/chat presence)
      registerConnectionHandlers(currentSocket, {
        onSocketConnected: (list) => console.log("🔌 Connected sockets:", list),
        onNotify: (data) => console.log("🔔 Notification:", data),
        onChatLeft: (data) => console.log("🚪 Chat left:", data),
        onDisconnect: () => console.log("❌ Socket disconnected"),
      });

      isInitializedRef.current = true;
    }

    // 🔌 Connect the socket (trigger the handshake)
    currentSocket.connect();

    // 🔌 Clean up socket connection on unmount
    return () => {
      currentSocket.disconnect();
      isInitializedRef.current = false;
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
