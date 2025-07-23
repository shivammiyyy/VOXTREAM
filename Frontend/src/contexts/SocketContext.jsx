import { createContext, useContext, useEffect, useRef } from "react";
import socket from "../sockets/socket";
import { emitNewConnection } from "../sockets/connectionHandlers";
import { registerChatHandlers } from "../sockets/chatHandlers";
import { registerCallHandlers } from "../sockets/callHandlers";
import { registerConnectionHandlers } from "../sockets/connectionHandlers";

const SocketContext = createContext();

export const SocketProvider = ({ user, children }) => {
  const socketRef = useRef(socket);

  useEffect(() => {
    if (!user) return;

    // Connect and identify this user
    socketRef.current.connect();
    emitNewConnection(socketRef.current, user._id);

    // Register handlers ONCE
    registerChatHandlers(socketRef.current, {
      onMessage: (msg) => console.log("Message received:", msg),
      onHistory: (msgs) => console.log("Chat history:", msgs),
    });

    registerCallHandlers(socketRef.current, {
      onCallRequest: (data) => console.log("Call request from", data),
      onCallResponse: (res) => console.log("Call response:", res),
      onUserLeft: () => console.log("User left call"),
      onRemoteStream: (stream) => {
        console.log("Remote stream received", stream);
        // Set this to state in CallPage if needed
      },
    });

    registerConnectionHandlers(socketRef.current, {
      onSocketConnected: (list) => console.log("Connected sockets", list),
      onNotify: (data) => console.log("Notification:", data),
      onChatLeft: (data) => console.log("Chat left:", data),
      onDisconnect: () => console.log("Socket disconnected"),
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
