// services/PeerService.js

class PeerService {
  constructor() {
    this.peer = null;
    this.remoteStream = null;              // MediaStream built from remote tracks
    this.remoteStreamCallback = null;      // Hook to deliver new remote streams
    this.iceCandidateCallback = null;      // Hook to deliver ICE candidates
  }

  /** 
   * (Re)initializes RTCPeerConnection with STUN/TURN ICE servers 
   * and sets up onicecandidate & ontrack handlers.
   */
  initializePeer() {
    this.destroyPeer();  // Clean up any existing connection

    this.peer = new RTCPeerConnection({
      iceServers: [
        // public STUN servers
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },
        // example TURN server
        {
          urls: "turn:your.turn.server:3478",
          username: "turnUser",
          credential: "turnCredential",
        },
      ],
    });

    // Whenever a local ICE candidate is found, pass it to signaling
    this.peer.onicecandidate = (event) => {
      if (event.candidate && this.iceCandidateCallback) {
        this.iceCandidateCallback(event.candidate);
      }
    };

    // Whenever a remote track arrives, build or extend the remoteStream
    this.peer.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      this.remoteStream.addTrack(event.track);

      // Push the updated MediaStream to the UI/further logic
      if (this.remoteStreamCallback) {
        this.remoteStreamCallback(this.remoteStream);
      }
    };
  }

  /** Closes existing connection and clears streams. */
  destroyPeer() {
    if (this.peer) {
      this.peer.close();
      this.peer = null;
      this.remoteStream = null;
    }
  }

  /** Register a callback to send ICE candidates to remote peer via your signaling */
  setIceCandidateCallback(cb) {
    this.iceCandidateCallback = cb;
  }

  /** Register a callback to deliver the assembled remote MediaStream to your UI */
  setRemoteStreamCallback(cb) {
    this.remoteStreamCallback = cb;
  }

  /** Add all tracks from a local MediaStream to the peer connection */
  addLocalTracks(stream) {
    if (!this.peer || !stream) {
      console.warn("Cannot add tracks: peer or stream not available.");
      return;
    }
    stream.getTracks().forEach((track) => {
      this.peer.addTrack(track, stream);
    });
  }

  /**
   * Creates an SDP offer, sets it as local description, and returns it.
   * Caller should signal this offer to the remote peer.
   */
  async getOffer() {
    if (!this.peer) return null;
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(offer);
    return offer;
  }

  /**
   * Given a remote SDP offer, sets it as remote description,
   * creates and sets a local SDP answer, and returns that answer.
   * Caller should signal this answer back to the offerer.
   */
  async getAnswer(offerSdp) {
    if (!this.peer) return null;
    await this.peer.setRemoteDescription(new RTCSessionDescription(offerSdp));
    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(answer);
    return answer;
  }

  /** Apply an incoming SDP (offer or answer) as the remote description */
  async setRemoteDescription(sdp) {
    if (!this.peer) return;
    await this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  /** Add a received ICE candidate to the peer connection */
  async addIceCandidate(candidate) {
    if (this.peer && candidate) {
      try {
        await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Failed to add ICE candidate:", err);
      }
    }
  }
}

// Export a single instance for easy import/use in your components
export default new PeerService();
