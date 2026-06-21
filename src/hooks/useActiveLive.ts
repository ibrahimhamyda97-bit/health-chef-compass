import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LiveSession {
  id: string;
  host_user_id: string;
  host_name: string;
  title: string;
  is_active: boolean;
  started_at: string;
  ended_at: string | null;
  viewer_count: number;
}

export function useActiveLiveSessions() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchLives = async () => {
      const { data } = await supabase
        .from("live_sessions")
        .select("*")
        .eq("is_active", true)
        .order("started_at", { ascending: false });
      if (mounted && data) setSessions(data as LiveSession[]);
      if (mounted) setLoading(false);
    };

    fetchLives();

    const channel = supabase
      .channel("live-sessions-watch")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_sessions" },
        () => fetchLives()
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { sessions, loading, hasActive: sessions.length > 0 };
}
