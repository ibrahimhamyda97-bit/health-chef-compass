// Shared WebRTC helpers and signaling types for the P2P live system.
// Uses Supabase Realtime broadcast as the signaling channel.

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
];

export type SignalType =
  | "viewer-join"
  | "publisher-here"
  | "offer"
  | "answer"
  | "ice"
  | "cohost-request"
  | "cohost-approved"
  | "cohost-denied"
  | "publisher-leave"
  | "viewer-leave";

export interface SignalPayload {
  type: SignalType;
  from: string;
  to?: string;
  fromName?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export const channelName = (sessionId: string) => `live:${sessionId}`;

export function createPeer(): RTCPeerConnection {
  return new RTCPeerConnection({ iceServers: ICE_SERVERS });
}
