import { useEffect, useState } from "react";
import { MessageCircle, Send, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: string;
  user_id: string;
  display_name: string | null;
  content: string;
  created_at: string;
}

export default function PhotoComments({ photoId }: { photoId: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const loadCount = async () => {
    const { count: c } = await supabase
      .from("chef_gallery_comments")
      .select("*", { count: "exact", head: true })
      .eq("photo_id", photoId);
    setCount(c || 0);
  };

  const loadComments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("chef_gallery_comments")
      .select("*")
      .eq("photo_id", photoId)
      .order("created_at", { ascending: true });
    setComments((data as Comment[]) || []);
    setCount(data?.length || 0);
    setLoading(false);
  };

  useEffect(() => {
    loadCount();
  }, [photoId]);

  useEffect(() => {
    if (open) loadComments();
  }, [open]);

  const handlePost = async () => {
    if (!user) {
      toast.error("Connecte-toi pour commenter");
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;
    if (trimmed.length > 500) {
      toast.error("Commentaire trop long (500 max)");
      return;
    }
    setPosting(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      const { error } = await supabase.from("chef_gallery_comments").insert({
        photo_id: photoId,
        user_id: user.id,
        display_name: profile?.display_name || user.email,
        content: trimmed,
      });
      if (error) throw error;
      setText("");
      loadComments();
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("chef_gallery_comments").delete().eq("id", id);
    if (error) {
      toast.error("Suppression impossible");
      return;
    }
    loadComments();
  };

  return (
    <div className="border-t border-[hsl(45,60%,40%,0.15)] mt-1 pt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-[hsl(0,0%,60%)] hover:text-[hsl(45,70%,60%)] transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span className="font-semibold">{count}</span>
        <span>{count > 1 ? "commentaires" : "commentaire"}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              {loading ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[hsl(45,70%,50%)]" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-[11px] text-[hsl(0,0%,55%)] italic">
                  Sois le premier à partager un conseil de dressage…
                </p>
              ) : (
                <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {comments.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-lg bg-[hsl(0,0%,8%)] border border-[hsl(45,60%,40%,0.15)] p-2"
                    >
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[11px] font-semibold text-[hsl(45,60%,70%)] truncate">
                          {c.display_name || "Chef"}
                        </span>
                        {user?.id === c.user_id && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="text-[hsl(0,0%,50%)] hover:text-red-400"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-[hsl(0,0%,85%)] whitespace-pre-wrap break-words">
                        {c.content}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {user ? (
                <div className="flex items-end gap-2">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Un conseil, une astuce, un compliment…"
                    maxLength={500}
                    rows={2}
                    className="bg-[hsl(0,0%,8%)] border-[hsl(0,0%,18%)] text-[hsl(0,0%,90%)] text-xs min-h-[44px] resize-none"
                  />
                  <Button
                    onClick={handlePost}
                    disabled={posting || !text.trim()}
                    size="icon"
                    className="bg-[hsl(45,70%,50%)] hover:bg-[hsl(45,70%,45%)] text-[hsl(0,0%,10%)] shrink-0 h-10 w-10"
                  >
                    {posting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-[11px] text-[hsl(0,0%,55%)] italic">
                  Connecte-toi pour participer à la discussion.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
