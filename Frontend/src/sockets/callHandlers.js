import PeerService from "../webrtc/PeerService";

export const registerCallHandlers = (
  socket,
  { onCallRequest, onCallResponse, onUserLeft, onRemoteStream }
) => {
  PeerService.initializePeer(); // Ensure peer is ready

  // Handle incoming call request popup
  socket.on("call-request", onCallRequest);

  // Handle whether call was accepted/rejected
  socket.on("call-response", ({ callerId, accepted }) => {
    onCallResponse({ callerId, accepted });
  });

  // Handle signal exchange (SDP + ICE)
  socket.on("signal-data", async ({ senderId, signal }) => {
    console.log("📡 Signal data received:", signal);

    if (signal.type === "offer") {
      const answer = await PeerService.getAnswer(signal.sdp);
      socket.emit("signal-data", {
        targetId: senderId,
        signal: { type: "answer", sdp: answer },
      });
    }

    if (signal.type === "answer") {
      await PeerService.setRemoteDescription(signal.sdp);
    }

    if (signal.type === "candidate") {
      try {
        await PeerService.peer.addIceCandidate(signal.candidate);
      } catch (err) {
        console.error("❌ Failed to add ICE candidate:", err);
      }
    }
  });

socket.on("user-left", ({ userId }) => {
  if (userId !== socket.user?._id) {
    onUserLeft({ userId });
  }
});
  if (onRemoteStream && PeerService.peer) {
    PeerService.setRemoteStreamCallback(onRemoteStream);
  }
};

export const sendCallRequest = (socket, receiverId, callType = "video") => {
  socket.emit("call-request", {
    calleeId: receiverId, // ✅ FIXED: matches backend
    type: callType,
  });
};

export const sendCallResponse = (socket, callerId, accepted) => {
  socket.emit("call-response", { callerId, accepted });
};

export const sendSignalData = (socket, targetId, signal) => {
  socket.emit("signal-data", { targetId, signal });
};

export const notifyLeaveCall = (socket, targetId) => {
  socket.emit("leave-room", { targetId });
};
