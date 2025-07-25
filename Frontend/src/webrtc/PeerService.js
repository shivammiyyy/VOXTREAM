class PeerService {
  constructor() {
    this.peer = null;
    this.remoteStreamCallback = null;
    this.iceCandidateCallback = null;
  }

  initializePeer() {
    this.destroyPeer(); // Always reset if already exists

    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });

    this.peer.onicecandidate = (event) => {
      if (event.candidate && this.iceCandidateCallback) {
        this.iceCandidateCallback(event.candidate);
      }
    };

    this.peer.ontrack = (event) => {
      if (this.remoteStreamCallback) {
        const [remoteStream] = event.streams;
        this.remoteStreamCallback(remoteStream);
      }
    };
  }

  destroyPeer() {
    if (this.peer) {
      this.peer.close();
      this.peer = null;
    }
  }

  setIceCandidateCallback(cb) {
    this.iceCandidateCallback = cb;
  }

  setRemoteStreamCallback(cb) {
    this.remoteStreamCallback = cb;
  }

  addLocalTracks(stream) {
    if (!this.peer || this.peer.signalingState === "closed") {
      console.warn("❌ Cannot add tracks: peer not initialized or closed.");
      return;
    }

    stream.getTracks().forEach((track) => {
      this.peer.addTrack(track, stream);
    });
  }

  async getOffer() {
    if (!this.peer) return null;

    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(new RTCSessionDescription(offer));
    return offer;
  }

  async getAnswer(offer) {
    if (!this.peer) return null;

    await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(new RTCSessionDescription(answer));
    return answer;
  }

  async setRemoteDescription(sdp) {
    if (!this.peer) return;
    await this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  async addIceCandidate(candidate) {
    if (this.peer && candidate) {
      try {
        await this.peer.addIceCandidate(candidate);
      } catch (err) {
        console.error("Failed to add ICE candidate:", err);
      }
    }
  }
}

export default new PeerService();
