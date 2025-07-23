import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import { registerCallHandlers, sendCallRequest } from "../sockets/callHandlers";
import PeerService from "../webrtc/PeerService";
import { useSearchParams } from "react-router-dom";


const CallPage = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const { id: friendId } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const callType = params.get("type") || "video";

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (!socket || !user || !friendId) return;

    const constraints = {
      audio: true,
      video: callType === "video",
    };
    // Setup local media
    navigator.mediaDevices.getUserMedia(constraints)
      .then((localStream) => {
        setStream(localStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        localStream.getTracks().forEach((track) => {
          PeerService.peer.addTrack(track, localStream);
        });

        // Send offer to friend
        sendCallRequest(socket, friendId);

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
      })
      .catch((err) => {
        console.error("Failed to get local stream", err);
        alert("Cannot access camera or microphone.");
        navigate("/chat/" + friendId);
      });

    return () => {
      PeerService.peer.close();
      socket.emit("leave-room", { userId: user._id, targetId: friendId });
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [socket, user, friendId, navigate, stream, callType]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black text-white">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h2 className="mb-2">You</h2>
        <video ref={localVideoRef} autoPlay playsInline muted className="rounded w-full max-w-md shadow-lg" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h2 className="mb-2">Friend</h2>
        <video ref={remoteVideoRef} autoPlay playsInline className="rounded w-full max-w-md shadow-lg" />
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
