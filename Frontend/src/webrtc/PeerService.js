class PeerService {
  constructor() {
    this.peer = null;
    this.remoteStreamCallback = null;
    this.iceCandidateCallback = null;
  }

  initializePeer() {
    this.destroyPeer(); // Reset if already exists

    console.log("🧩 Initializing new RTCPeerConnection...");

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

    // 📡 ICE Candidate discovery
    this.peer.onicecandidate = (event) => {
      if (event.candidate && this.iceCandidateCallback) {
        console.log("📶 ICE candidate generated:", event.candidate);
        this.iceCandidateCallback(event.candidate);
      }
    };

    // 🎥 Handle remote media stream
    this.peer.ontrack = (event) => {
      console.log("📺 Remote track received.");
      if (this.remoteStreamCallback) {
        const [remoteStream] = event.streams;
        this.remoteStreamCallback(remoteStream);
      }
    };

    this.peer.oniceconnectionstatechange = () => {
      console.log("🔄 ICE connection state:", this.peer.iceConnectionState);
    };

    this.peer.onsignalingstatechange = () => {
      console.log("📶 Signaling state:", this.peer.signalingState);
    };
  }

  destroyPeer() {
    if (this.peer) {
      console.log("🧹 Destroying existing peer connection.");
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

    console.log("🎙️ Adding local media tracks...");
    stream.getTracks().forEach((track) => {
      this.peer.addTrack(track, stream);
    });
  }

  async getOffer() {
    if (!this.peer) {
      console.error("❌ Peer not initialized. Cannot create offer.");
      return null;
    }

    try {
      console.log("📨 Creating SDP offer...");
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      console.log("✅ SDP offer created and local description set.");
      return offer;
    } catch (err) {
      console.error("❌ Failed to create SDP offer:", err);
      return null;
    }
  }

  async getAnswer(offer) {
    if (!this.peer) {
      console.error("❌ Peer not initialized. Cannot create answer.");
      return null;
    }

    try {
      console.log("📨 Received SDP offer. Creating answer...");
      await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(answer));
      console.log("✅ SDP answer created and local description set.");
      return answer;
    } catch (err) {
      console.error("❌ Failed to handle offer and create answer:", err);
      return null;
    }
  }

  async setRemoteDescription(sdp) {
    if (!this.peer) {
      console.error("❌ Peer not initialized. Cannot set remote description.");
      return;
    }

    try {
      console.log("📩 Setting remote SDP description...");
      await this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log("✅ Remote description set.");
    } catch (err) {
      console.error("❌ Failed to set remote description:", err);
    }
  }

  async addIceCandidate(candidate) {
    if (this.peer && candidate) {
      try {
        console.log("📥 Adding received ICE candidate...");
        await this.peer.addIceCandidate(candidate);
        console.log("✅ ICE candidate added.");
      } catch (err) {
        console.error("❌ Failed to add ICE candidate:", err);
      }
    }
  }
}

export default new PeerService();
