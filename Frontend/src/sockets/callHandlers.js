import PeerService from "../webrtc/PeerService";

export const registerCallHandlers = (
  socket,
  { onCallRequest, onCallResponse, onUserLeft, onRemoteStream }
) => {
  // Handle incoming call request popup
  socket.on("call-request", onCallRequest);

  // Handle whether call was accepted/rejected
  socket.on("call-response", ({ callerId, accepted }) => {
    onCallResponse({ callerId, accepted });
  });

  // Handle signal exchange (SDP + ICE)
  socket.on("signal-data", async ({ senderId, signal }) => {
    if (signal.type === "offer") {
      const answer = await PeerService.getAnswer(signal.sdp);
      socket.emit("signal-data", {
        targetId: senderId,
        signal: { type: "answer", sdp: answer },
      });
    }

    if (signal.type === "answer") {
      await PeerService.setLocalDescription(signal.sdp);
    }

    if (signal.type === "candidate") {
      try {
        await PeerService.peer.addIceCandidate(signal.candidate);
      } catch (err) {
        console.error("Failed to add ICE candidate:", err);
      }
    }
  });

  socket.on("user-left", onUserLeft);

  // Attach ontrack listener for remote stream
  if (onRemoteStream && PeerService.peer) {
    PeerService.setRemoteStreamCallback(onRemoteStream);
  }
};

export const sendCallRequest = (socket, receiverId, callType = "video") => {
  socket.emit("call-request", {
    receiverId,
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
