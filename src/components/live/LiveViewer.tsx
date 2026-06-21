import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Hand, LogOut, Radio, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { channelName, createPeer, SignalPayload } from "./webrtc";
import type { RealtimeChannel } from "@supabase/supabase-js";
import LiveBroadcaster from "./LiveBroadcaster";

interface Props {
  sessionId: string;
  hostUserId: string;
  hostName: string;
  myUserId: string;
  myName: string;
  onLeave: () => void;
}

interface PublisherStream {
  publisherId: string;
  publisherName: string;
  stream: MediaStream;
}

export default function LiveViewer({ sessionId, hostUserId, hostName, myUserId, myName, onLeave }: Props) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const publisherNamesRef = useRef<Map<string, string>>(new Map());

  const [publishers, setPublishers] = useState<PublisherStream[]>([]);
  const [requestedCohost, setRequestedCohost] = useState(false);
  const [isCohost, setIsCohost] = useState(false);
  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    publisherNamesRef.current.set(hostUserId, hostName);

    const ch = supabase.channel(channelName(sessionId), { config: { broadcast: { self: false } } });
    channelRef.current = ch;

    ch.on("broadcast", { event: "signal" }, async ({ payload }: { payload: SignalPayload }) => {
      if (payload.to && payload.to !== myUserId) return;

      if (payload.type === "publisher-here" && payload.fromName) {
        publisherNamesRef.current.set(payload.from, payload.fromName);
      }

      if (payload.type === "offer" && payload.sdp) {
        await handleOffer(payload.from, payload.sdp);
      }

      if (payload.type === "ice" && payload.candidate) {
        const pc = peersRef.current.get(payload.from);
        if (pc) {
          try { await pc.addIceCandidate(payload.candidate); } catch {}
        }
      }

      if (payload.type === "publisher-leave") {
        const pc = peersRef.current.get(payload.from);
        if (pc) { pc.close(); peersRef.current.delete(payload.from); }
        setPublishers((prev) => prev.filter((p) => p.publisherId !== payload.from));
      }

      if (payload.type === "cohost-approved") {
        setIsCohost(true);
        setRequestedCohost(false);
        toast.success("Tu es maintenant co-host ! Ta caméra va démarrer.");
      }

      if (payload.type === "cohost-denied") {
        setRequestedCohost(false);
        toast.error("Demande de co-host refusée.");
      }
    }).subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setConnecting(false);
        ch.send({ type: "broadcast", event: "signal", payload: { type: "viewer-join", from: myUserId, fromName: myName } as SignalPayload });
      }
    });

    return () => {
      try {
        ch.send({ type: "broadcast", event: "signal", payload: { type: "viewer-leave", from: myUserId } as SignalPayload });
      } catch {}
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      supabase.removeChannel(ch);
    };
  }, [sessionId, hostUserId, hostName, myUserId, myName]);

  const handleOffer = async (publisherId: string, sdp: RTCSessionDescriptionInit) => {
    const ch = channelRef.current;
    if (!ch) return;

    let pc = peersRef.current.get(publisherId);
    if (pc) { pc.close(); }
    pc = createPeer();
    peersRef.current.set(publisherId, pc);

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        ch.send({ type: "broadcast", event: "signal", payload: { type: "ice", from: myUserId, to: publisherId, candidate: ev.candidate.toJSON() } as SignalPayload });
      }
    };

    pc.ontrack = (ev) => {
      const [stream] = ev.streams;
      setPublishers((prev) => {
        const existing = prev.find((p) => p.publisherId === publisherId);
        if (existing) return prev;
        return [...prev, { publisherId, publisherName: publisherNamesRef.current.get(publisherId) || "Chef", stream }];
      });
    };

    await pc.setRemoteDescription(sdp);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    ch.send({ type: "broadcast", event: "signal", payload: { type: "answer", from: myUserId, to: publisherId, sdp: answer } as SignalPayload });
  };

  const requestCohost = () => {
    channelRef.current?.send({
      type: "broadcast",
      event: "signal",
      payload: { type: "cohost-request", from: myUserId, to: hostUserId, fromName: myName } as SignalPayload,
    });
    setRequestedCohost(true);
    toast.info("Demande envoyée à l'hôte...");
  };

  // If approved as cohost, switch to broadcaster mode
  if (isCohost) {
    return (
      <LiveBroadcaster
        sessionId={sessionId}
        hostUserId={hostUserId}
        myUserId={myUserId}
        myName={myName}
        role="cohost"
        onLeave={onLeave}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className={`grid gap-3 ${publishers.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
        {publishers.length === 0 ? (
          <div className="aspect-video rounded-2xl bg-black flex items-center justify-center">
            <div className="text-center">
              <Radio className="w-8 h-8 text-red-500 animate-pulse mx-auto mb-2" />
              <p className="text-white text-sm">{connecting ? "Connexion au live..." : "En attente du flux vidéo..."}</p>
            </div>
          </div>
        ) : (
          publishers.map((pub) => (
            <RemoteVideo key={pub.publisherId} stream={pub.stream} name={pub.publisherName} isHost={pub.publisherId === hostUserId} />
          ))
        )}
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Button
          onClick={requestCohost}
          disabled={requestedCohost}
          variant="secondary"
          size="sm"
          className="gap-1.5"
        >
          <Hand className="w-4 h-4" />
          {requestedCohost ? "Demande envoyée..." : "Demander à monter en live"}
        </Button>
        <Button onClick={onLeave} variant="destructive" size="sm" className="gap-1.5">
          <LogOut className="w-4 h-4" /> Quitter
        </Button>
      </div>
    </div>
  );
}

function RemoteVideo({ stream, name, isHost }: { stream: MediaStream; name: string; isHost: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-2xl overflow-hidden bg-black aspect-video">
      <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div className="bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {name} {isHost && "👑"}
        </div>
      </div>
      <div className="absolute top-3 left-3">
        <div className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
        </div>
      </div>
    </motion.div>
  );
}
