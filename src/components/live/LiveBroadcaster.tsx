import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Users, UserCheck, UserX, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { channelName, createPeer, SignalPayload } from "./webrtc";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface CohostRequest {
  viewerId: string;
  viewerName: string;
}

interface Props {
  sessionId: string;
  hostUserId: string;
  myUserId: string;
  myName: string;
  /** "host" creates the session and approves cohosts. "cohost" only publishes. */
  role: "host" | "cohost";
  onLeave: () => void;
}

export default function LiveBroadcaster({ sessionId, hostUserId, myUserId, myName, role, onLeave }: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);

  const [viewerCount, setViewerCount] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [cohostRequests, setCohostRequests] = useState<CohostRequest[]>([]);
  const [approvedCohosts, setApprovedCohosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err: any) {
        toast.error("Impossible d'accéder à la caméra/micro: " + err.message);
        onLeave();
        return;
      }

      const ch = supabase.channel(channelName(sessionId), { config: { broadcast: { self: false } } });
      channelRef.current = ch;

      ch.on("broadcast", { event: "signal" }, async ({ payload }: { payload: SignalPayload }) => {
        if (payload.to && payload.to !== myUserId) return;

        if (payload.type === "viewer-join") {
          // A viewer joined — send them an offer
          await createOfferFor(payload.from);
          // Announce we're publishing
          ch.send({ type: "broadcast", event: "signal", payload: { type: "publisher-here", from: myUserId, fromName: myName } as SignalPayload });
        }

        if (payload.type === "answer" && payload.sdp) {
          const pc = peersRef.current.get(payload.from);
          if (pc) await pc.setRemoteDescription(payload.sdp);
        }

        if (payload.type === "ice" && payload.candidate) {
          const pc = peersRef.current.get(payload.from);
          if (pc) {
            try { await pc.addIceCandidate(payload.candidate); } catch {}
          }
        }

        if (payload.type === "viewer-leave") {
          closePeer(payload.from);
          setViewerCount((c) => Math.max(0, c - 1));
        }

        if (payload.type === "cohost-request" && role === "host" && payload.fromName) {
          setCohostRequests((prev) =>
            prev.find((r) => r.viewerId === payload.from) ? prev : [...prev, { viewerId: payload.from, viewerName: payload.fromName! }]
          );
        }
      }).subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Announce presence
          ch.send({ type: "broadcast", event: "signal", payload: { type: "publisher-here", from: myUserId, fromName: myName } as SignalPayload });
        }
      });
    };

    start();

    return () => {
      cancelled = true;
      try {
        channelRef.current?.send({ type: "broadcast", event: "signal", payload: { type: "publisher-leave", from: myUserId } as SignalPayload });
      } catch {}
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [sessionId, myUserId, myName, role, onLeave]);

  const createOfferFor = async (viewerId: string) => {
    const ch = channelRef.current;
    const stream = localStreamRef.current;
    if (!ch || !stream) return;

    let pc = peersRef.current.get(viewerId);
    if (!pc) {
      pc = createPeer();
      peersRef.current.set(viewerId, pc);
      stream.getTracks().forEach((track) => pc!.addTrack(track, stream));
      pc.onicecandidate = (ev) => {
        if (ev.candidate) {
          ch.send({ type: "broadcast", event: "signal", payload: { type: "ice", from: myUserId, to: viewerId, candidate: ev.candidate.toJSON() } as SignalPayload });
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc!.connectionState === "connected") setViewerCount((c) => c + 1);
        if (pc!.connectionState === "failed" || pc!.connectionState === "disconnected") closePeer(viewerId);
      };
    }
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ch.send({ type: "broadcast", event: "signal", payload: { type: "offer", from: myUserId, to: viewerId, sdp: offer } as SignalPayload });
  };

  const closePeer = (viewerId: string) => {
    const pc = peersRef.current.get(viewerId);
    if (pc) {
      pc.close();
      peersRef.current.delete(viewerId);
    }
  };

  const toggleMic = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((v) => !v);
  };
  const toggleCam = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamOn((v) => !v);
  };

  const approveCohost = (viewerId: string) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "signal",
      payload: { type: "cohost-approved", from: myUserId, to: viewerId } as SignalPayload,
    });
    setApprovedCohosts((prev) => new Set(prev).add(viewerId));
    setCohostRequests((prev) => prev.filter((r) => r.viewerId !== viewerId));
    toast.success("Co-host approuvé !");
  };

  const denyCohost = (viewerId: string) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "signal",
      payload: { type: "cohost-denied", from: myUserId, to: viewerId } as SignalPayload,
    });
    setCohostRequests((prev) => prev.filter((r) => r.viewerId !== viewerId));
  };

  // Update viewer count in DB periodically (host only)
  useEffect(() => {
    if (role !== "host") return;
    const interval = setInterval(() => {
      supabase.from("live_sessions").update({ viewer_count: viewerCount }).eq("id", sessionId);
    }, 5000);
    return () => clearInterval(interval);
  }, [viewerCount, sessionId, role]);

  const handleEnd = async () => {
    if (role === "host") {
      await supabase.from("live_sessions").update({ is_active: false, ended_at: new Date().toISOString() }).eq("id", sessionId);
    }
    onLeave();
  };

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
        <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            LIVE
          </div>
          <div className="flex items-center gap-1 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
            <Users className="w-3 h-3" /> {viewerCount}
          </div>
          {role === "cohost" && (
            <div className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">CO-HOST</div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Button onClick={toggleMic} variant={micOn ? "secondary" : "destructive"} size="sm" className="gap-1.5">
          {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          {micOn ? "Micro" : "Muet"}
        </Button>
        <Button onClick={toggleCam} variant={camOn ? "secondary" : "destructive"} size="sm" className="gap-1.5">
          {camOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          {camOn ? "Caméra" : "Off"}
        </Button>
        <Button onClick={handleEnd} variant="destructive" size="sm" className="gap-1.5">
          <PhoneOff className="w-4 h-4" /> {role === "host" ? "Arrêter le live" : "Quitter"}
        </Button>
      </div>

      {role === "host" && cohostRequests.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-2">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" /> Demandes pour monter en live
          </p>
          {cohostRequests.map((req) => (
            <div key={req.viewerId} className="flex items-center justify-between gap-2 bg-card rounded-lg p-2">
              <span className="text-sm">{req.viewerName}</span>
              <div className="flex gap-1">
                <Button size="sm" onClick={() => approveCohost(req.viewerId)} className="h-7 gap-1 bg-green-500 hover:bg-green-600 text-white">
                  <UserCheck className="w-3 h-3" /> Accepter
                </Button>
                <Button size="sm" variant="ghost" onClick={() => denyCohost(req.viewerId)} className="h-7 gap-1">
                  <UserX className="w-3 h-3" /> Refuser
                </Button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {role === "host" && approvedCohosts.size > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {approvedCohosts.size} co-host{approvedCohosts.size > 1 ? "s" : ""} approuvé{approvedCohosts.size > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
