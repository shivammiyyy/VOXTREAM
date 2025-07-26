import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
// *** FIX ***
// 'sendCallResponse' has been removed from this import as it's not used in this component.
import { sendSignalData } from "../sockets/callHandlers";
import PeerService from "../webrtc/PeerService";

const CallPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { id: friendId } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const isInitiator = params.get("initiator") === "true";
  const callType = params.get("type") || "video";

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  const handleCallInitiated = useCallback(async () => {
    const offer = await PeerService.getOffer();
    sendSignalData(socket, friendId, { type: "offer", sdp: offer });
  }, [socket, friendId]);

  const getMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Failed to get media stream:", err);
      alert("Could not access camera or microphone.");
      navigate(`/chat/${friendId}`);
      return null;
    }
  }, [callType, navigate, friendId]);

  const handleSignalData = useCallback(
    async ({ senderId, signal }) => {
      if (senderId !== friendId) return;

      switch (signal.type) {
        case "offer": {
          console.log("Received offer, creating answer...");
          const stream = await getMedia();
          if (stream) {
            PeerService.addLocalTracks(stream);
            const answer = await PeerService.getAnswer(signal.sdp);
            sendSignalData(socket, friendId, { type: "answer", sdp: answer });
          }
          break;
        }
        case "answer": {
          console.log("Received answer, setting remote description...");
          await PeerService.setRemoteDescription(signal.sdp);
          break;
        }
        case "candidate": {
          await PeerService.addIceCandidate(signal.candidate);
          break;
        }
      }
    },
    [socket, friendId, getMedia]
  );

  useEffect(() => {
    if (!socket || !user) return;

    PeerService.initializePeer();
    PeerService.setRemoteStreamCallback(setRemoteStream);
    PeerService.setIceCandidateCallback((candidate) => {
      sendSignalData(socket, friendId, { type: "candidate", candidate });
    });

    socket.on("signal-data", handleSignalData);

    const start = async () => {
      const stream = await getMedia();
      if (stream) {
        PeerService.addLocalTracks(stream);
        if (isInitiator) {
          handleCallInitiated();
        }
      }
    };
    start();

    return () => {
      PeerService.destroyPeer();
      socket.off("signal-data", handleSignalData);
      localStream?.getTracks().forEach((track) => track.stop());
      socket.emit("leave-room", { targetId: friendId });
    };
  }, [socket, user, friendId, isInitiator, getMedia, handleSignalData, handleCallInitiated, localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const endCall = () => {
    navigate(`/chat/${friendId}`);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black text-white">
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <h2 className="mb-2">Friend</h2>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="rounded w-full max-w-md shadow-lg bg-gray-900"
        />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <h2 className="mb-2">You</h2>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="rounded w-full max-w-md shadow-lg bg-gray-900"
        />
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={endCall}
          className="bg-red-600 px-8 py-4 rounded-full shadow hover:bg-red-700"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default CallPage;