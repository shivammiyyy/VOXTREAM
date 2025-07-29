import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import { sendSignalData } from "../sockets/callHandlers";
import PeerService from "../webrtc/PeerService";

const CallPage = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const { id: friendId } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();


  const isInitiator = params.get("initiator") === "true";
  const callType = params.get("type") || "video";

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  const [isMicOn, setIsMicOn] = useState(true);
const [isCameraOn, setIsCameraOn] = useState(true);

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
      console.error("❌ Failed to get media stream:", err);
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
          const stream = await getMedia();
          if (stream) {
            PeerService.addLocalTracks(stream);
            const answer = await PeerService.getAnswer(signal.sdp);
            sendSignalData(socket, friendId, { type: "answer", sdp: answer });
          }
          break;
        }
        case "answer":
          await PeerService.setRemoteDescription(signal.sdp);
          break;
        case "candidate":
          await PeerService.addIceCandidate(signal.candidate);
          break;
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
          await handleCallInitiated();
        }
      }
    };
    start();

    return () => {
      PeerService.destroyPeer();
      socket.off("signal-data", handleSignalData);
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [socket, user, friendId, isInitiator, getMedia, handleSignalData, handleCallInitiated, localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const endCall = () => {
    socket.emit("leave-room", { targetId: friendId });
    navigate(`/chat/${friendId}`);
  };

  const toggleMic = () => {
  localStream?.getAudioTracks().forEach(track => {
    track.enabled = !track.enabled;
    setIsMicOn(track.enabled);
  });
};

const toggleCamera = () => {
  localStream?.getVideoTracks().forEach(track => {
    track.enabled = !track.enabled;
    setIsCameraOn(track.enabled);
  });
};


  return (
    <div className="flex flex-col md:flex-row h-screen bg-black text-white relative">
      {/* Remote Stream */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h2 className="text-lg font-semibold mb-2">Friend</h2>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="rounded-md w-full max-w-3xl h-64 md:h-auto object-cover bg-gray-900 shadow"
        />
      </div>

      {/* Local Stream */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h2 className="text-lg font-semibold mb-2">You</h2>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="rounded-md w-full max-w-3xl h-64 md:h-auto object-cover bg-gray-900 shadow"
        />
      </div>

      {/* End Call Button */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2">
        <button
          onClick={endCall}
          className="bg-red-600 px-8 py-4 rounded-full shadow-md hover:bg-red-700 transition text-white text-lg font-semibold"
        >
          End Call
        </button>
      </div>
      {/* Call Info Panel */}
<div className="absolute top-5 left-5 bg-white text-black px-4 py-2 rounded shadow text-sm">
  <p className="font-semibold mb-1">Call Info</p>
  <p>Type: {callType}</p>
  <p>Status: {remoteStream ? "Connected" : "Waiting..."}</p>
</div>

{/* Toggle Buttons */}
<div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-4">
  <button
    onClick={toggleMic}
    className="bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition"
  >
    {isMicOn ? "Mute Mic" : "Unmute Mic"}
  </button>
  <button
    onClick={toggleCamera}
    className="bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition"
  >
    {isCameraOn ? "Camera Off" : "Camera On"}
  </button>
</div>

    </div>
  );
};

export default CallPage;
