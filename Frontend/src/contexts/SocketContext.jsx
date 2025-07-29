import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../sockets/socket";
import { emitNewConnection, registerConnectionHandlers } from "../sockets/connectionHandlers";
import { registerChatHandlers } from "../sockets/chatHandlers";
import { registerCallHandlers, sendCallResponse } from "../sockets/callHandlers";
import IncomingCallModal from "../components/Call/IncomingCallModal";

const SocketContext = createContext();

export const SocketProvider = ({ user, children }) => {
  const socketRef = useRef(socket);
  const isInitializedRef = useRef(false);
  const navigate = useNavigate();

  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    const currentSocket = socketRef.current;

    if (!user) {
      console.warn("🔒 User not authenticated. Skipping socket connection.");
      return;
    }

    if (!isInitializedRef.current) {
      currentSocket.on("connect", () => {
        console.log("✅ Socket connected:", currentSocket.id);
        emitNewConnection(currentSocket, user._id);
      });

      currentSocket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
      });

      registerChatHandlers(currentSocket, {
        onMessage: (msg) => console.log("💬 Message received:", msg),
        onHistory: (msgs) => console.log("📜 Chat history:", msgs),
      });

      registerCallHandlers(currentSocket, {
        onCallRequest: (data) => {
          console.log("📞 Incoming call request:", data);
          setIncomingCall({ ...data, type: data.type || "video" });
        },
        onCallResponse: (res) => {
          console.log("📲 Call response:", res);
        },
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

      currentSocket.on("error", (err) => {
        console.error("⚠️ Socket error received:", err);
      });

      isInitializedRef.current = true;
    }

    currentSocket.connect();

    return () => {
      currentSocket.disconnect();
      isInitializedRef.current = false;
    };
  }, [user]);

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    sendCallResponse(socketRef.current, incomingCall.callerId, true);
    navigate(`/call/${incomingCall.callerId}?type=${incomingCall.type}&initiator=false`);
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;
    sendCallResponse(socketRef.current, incomingCall.callerId, false);
    setIncomingCall(null);
  };

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}

      {incomingCall && (
        <IncomingCallModal
          callerId={incomingCall.callerId}
          callType={incomingCall.type}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
