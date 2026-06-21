import { Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActiveLiveSessions } from "@/hooks/useActiveLive";

interface LiveBadgeProps {
  compact?: boolean;
}

export function LiveBadge({ compact = false }: LiveBadgeProps) {
  const { sessions, hasActive } = useActiveLiveSessions();
  const navigate = useNavigate();

  if (!hasActive) return null;

  return (
    <button
      onClick={() => navigate("/live")}
      className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/40 hover:bg-red-500/25 transition-colors"
      title={`${sessions.length} live${sessions.length > 1 ? "s" : ""} en cours`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>
      {!compact && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
          Live · {sessions.length}
        </span>
      )}
      {compact && <Radio className="w-3 h-3 text-red-500" />}
    </button>
  );
}
