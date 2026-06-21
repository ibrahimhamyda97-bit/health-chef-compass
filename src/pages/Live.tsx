import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Radio, Plus, Users, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useActiveLiveSessions, type LiveSession } from "@/hooks/useActiveLive";
import LiveBroadcaster from "@/components/live/LiveBroadcaster";
import LiveViewer from "@/components/live/LiveViewer";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Live() {
  const { user, loading: authLoading } = useAuth();
  const { sessions, loading } = useActiveLiveSessions();
  const navigate = useNavigate();

  const [myName, setMyName] = useState("Chef");
  const [title, setTitle] = useState("");
  const [showStart, setShowStart] = useState(false);
  const [starting, setStarting] = useState(false);
  const [mySession, setMySession] = useState<LiveSession | null>(null);
  const [viewingSession, setViewingSession] = useState<LiveSession | null>(null);

  useEffect(() => {
    const loadName = async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle();
      if (data?.display_name) setMyName(data.display_name);
      else if (user.email) setMyName(user.email.split("@")[0]);
    };
    loadName();
  }, [user]);

  const startLive = async () => {
    if (!user) return;
    if (!title.trim()) { toast.error("Donne un titre à ton live"); return; }
    setStarting(true);
    const { data, error } = await supabase
      .from("live_sessions")
      .insert({ host_user_id: user.id, host_name: myName, title: title.trim() })
      .select()
      .single();
    setStarting(false);
    if (error || !data) { toast.error("Erreur: " + (error?.message ?? "inconnue")); return; }
    setMySession(data as LiveSession);
    setShowStart(false);
    toast.success("Live démarré !");
  };

  if (authLoading) return <p className="text-sm text-muted-foreground">Chargement...</p>;

  if (!user) {
    return (
      <div className="space-y-4 text-center py-12">
        <Radio className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
        <h1 className="text-2xl font-display font-bold">Live Vidéo</h1>
        <p className="text-muted-foreground">Connecte-toi pour démarrer ou rejoindre un live.</p>
        <Button onClick={() => navigate("/auth")}>Se connecter</Button>
      </div>
    );
  }

  // Hosting
  if (mySession) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Radio className="w-6 h-6 text-red-500 animate-pulse" /> Tu es en LIVE
          </h1>
          <p className="text-muted-foreground text-sm">{mySession.title}</p>
        </div>
        <LiveBroadcaster
          sessionId={mySession.id}
          hostUserId={mySession.host_user_id}
          myUserId={user.id}
          myName={myName}
          role="host"
          onLeave={() => setMySession(null)}
        />
      </div>
    );
  }

  // Viewing
  if (viewingSession) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-display font-bold">{viewingSession.title}</h1>
            <p className="text-xs text-muted-foreground">par {viewingSession.host_name}</p>
          </div>
        </div>
        <LiveViewer
          sessionId={viewingSession.id}
          hostUserId={viewingSession.host_user_id}
          hostName={viewingSession.host_name}
          myUserId={user.id}
          myName={myName}
          onLeave={() => setViewingSession(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Radio className="w-6 h-6 text-red-500" /> Live Vidéo
          </h1>
          <p className="text-muted-foreground text-sm">Démarre un live ou rejoins ceux en cours. Les viewers peuvent demander à monter en live.</p>
        </div>
        <Button onClick={() => setShowStart((v) => !v)} className="gap-2 bg-red-500 hover:bg-red-600 text-white">
          <Plus className="w-4 h-4" /> Démarrer un live
        </Button>
      </motion.div>

      {showStart && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-solid rounded-2xl p-5 space-y-3">
          <label className="text-sm font-medium">Titre du live</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Tutoriel macaron en direct" maxLength={120} />
          <div className="flex gap-2">
            <Button onClick={startLive} disabled={starting} className="bg-red-500 hover:bg-red-600 text-white">
              {starting ? "Démarrage..." : "Démarrer"}
            </Button>
            <Button variant="ghost" onClick={() => setShowStart(false)}>Annuler</Button>
          </div>
        </motion.div>
      )}

      <div>
        <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
          {loading ? "Chargement..." : `${sessions.length} live${sessions.length !== 1 ? "s" : ""} en cours`}
        </h2>
        {sessions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground rounded-2xl border border-dashed border-border">
            <Radio className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucun live actuellement. Sois le premier !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sessions.map((s) => (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setViewingSession(s)}
                className="glass-card-solid rounded-2xl p-4 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                  </div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" /> {s.viewer_count}
                  </span>
                </div>
                <p className="font-semibold text-sm line-clamp-2">{s.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <ChefHat className="w-3 h-3" /> {s.host_name}
                </p>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
