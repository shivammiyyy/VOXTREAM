import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import {
  registerCallHandlers,
  sendCallRequest,
  sendSignalData,
} from "../sockets/callHandlers";
import PeerService from "../webrtc/PeerService";

const CallPage = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const { id: friendId } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const callType = params.get("type") || "video";

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    if (!socket || !user || !friendId) return;

    const startCall = async () => {
      try {
        // 1. Initialize peer
        PeerService.initializePeer();

        // 2. Handle ICE candidates (emit to other user)
        PeerService.setIceCandidateCallback((candidate) => {
          sendSignalData(socket, friendId, {
            type: "candidate",
            candidate,
          });
        });

        // 3. Setup remote stream handler
        PeerService.setRemoteStreamCallback((remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        // 4. Get local media
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === "video",
        });

        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 5. Add tracks to peer
        PeerService.addLocalTracks(stream);

        // 6. Create offer and send to callee
        const offer = await PeerService.getOffer();
        sendSignalData(socket, friendId, {
          type: "offer",
          sdp: offer,
        });

        // 7. Register socket listeners
        registerCallHandlers(socket, {
          onCallRequest: () => {},
          onCallResponse: () => {},
          onUserLeft: () => {
            alert("User left the call");
            navigate("/chat/" + friendId);
          },
          onRemoteStream: (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          },
        });

        // 8. Notify call start
        sendCallRequest(socket, friendId, callType);
      } catch (err) {
        console.error("Failed to start call:", err);
        alert("Could not access camera or microphone.");
        navigate("/chat/" + friendId);
      }
    };

    startCall();

    return () => {
      PeerService.destroyPeer();
      socket.emit("leave-room", { userId: user._id, targetId: friendId });
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [socket, user, friendId, callType, navigate, localStream]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black text-white">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h2 className="mb-2">You</h2>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="rounded w-full max-w-md shadow-lg"
        />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h2 className="mb-2">Friend</h2>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="rounded w-full max-w-md shadow-lg"
        />
      </div>
      <div className="absolute top-4 right-4">
        <button
          onClick={() => navigate("/chat/" + friendId)}
          className="bg-red-600 px-4 py-2 rounded shadow hover:bg-red-700"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default CallPage;
