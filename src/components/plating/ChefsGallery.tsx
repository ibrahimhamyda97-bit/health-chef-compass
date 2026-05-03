import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Upload, Share2, Sparkles, X, Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PhotoComments from "./PhotoComments";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Photo {
  id: string;
  user_id: string;
  display_name: string | null;
  title: string | null;
  photo_url: string;
  before_photo_url: string | null;
  is_challenge: boolean;
  created_at: string;
}

export default function ChefsGallery() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [likes, setLikes] = useState<Record<string, { count: number; liked: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<Photo | null>(null);
  const [mode, setMode] = useState<"single" | "challenge">("single");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: ph } = await supabase
      .from("chef_gallery_photos")
      .select("*")
      .order("created_at", { ascending: false });
    setPhotos((ph as Photo[]) || []);

    const { data: lk } = await supabase.from("chef_gallery_likes").select("photo_id, user_id");
    const map: Record<string, { count: number; liked: boolean }> = {};
    (lk || []).forEach((l: any) => {
      if (!map[l.photo_id]) map[l.photo_id] = { count: 0, liked: false };
      map[l.photo_id].count++;
      if (user && l.user_id === user.id) map[l.photo_id].liked = true;
    });
    setLikes(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const toggleLike = async (photoId: string) => {
    if (!user) {
      toast.error("Connecte-toi pour aimer une création");
      return;
    }
    const current = likes[photoId] || { count: 0, liked: false };
    if (current.liked) {
      await supabase.from("chef_gallery_likes").delete().eq("photo_id", photoId).eq("user_id", user.id);
      setLikes({ ...likes, [photoId]: { count: current.count - 1, liked: false } });
    } else {
      await supabase.from("chef_gallery_likes").insert({ photo_id: photoId, user_id: user.id });
      setLikes({ ...likes, [photoId]: { count: current.count + 1, liked: true } });
    }
  };

  const uploadFile = async (f: File): Promise<string> => {
    const ext = f.name.split(".").pop();
    const path = `${user!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("chef-gallery").upload(path, f);
    if (error) throw error;
    const { data } = supabase.storage.from("chef-gallery").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleUpload = async () => {
    if (!user) {
      toast.error("Connecte-toi pour partager ta création");
      return;
    }
    if (!file) {
      toast.error("Sélectionne une photo");
      return;
    }
    if (mode === "challenge" && !beforeFile) {
      toast.error("Le mode Challenge nécessite 2 photos");
      return;
    }
    setUploading(true);
    try {
      const photoUrl = await uploadFile(file);
      const beforeUrl = beforeFile ? await uploadFile(beforeFile) : null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();

      const { error } = await supabase.from("chef_gallery_photos").insert({
        user_id: user.id,
        display_name: profile?.display_name || user.email,
        title: title || null,
        photo_url: photoUrl,
        before_photo_url: beforeUrl,
        is_challenge: mode === "challenge",
      });
      if (error) throw error;
      toast.success("Ta création est en ligne !");
      setUploadOpen(false);
      setFile(null);
      setBeforeFile(null);
      setTitle("");
      setMode("single");
      load();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'envoi");
    } finally {
      setUploading(false);
    }
  };

  const generateShareImage = async (photo: Photo): Promise<Blob | null> => {
    const W = 1080;
    const H = 1350;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Background gradient
    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, "#0a0a0a");
    grd.addColorStop(1, "#1a1410");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Load photo
    const loadImg = (url: string): Promise<HTMLImageElement> =>
      new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = url;
      });

    try {
      if (photo.is_challenge && photo.before_photo_url) {
        const [b, a] = await Promise.all([loadImg(photo.before_photo_url), loadImg(photo.photo_url)]);
        const colW = (W - 120) / 2;
        const colH = 700;
        const y = 280;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(40, y, colW, colH, 24);
        ctx.clip();
        ctx.drawImage(b, 40, y, colW, colH);
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(80 + colW, y, colW, colH, 24);
        ctx.clip();
        ctx.drawImage(a, 80 + colW, y, colW, colH);
        ctx.restore();

        ctx.fillStyle = "#D4AF37";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("AVANT", 40 + colW / 2, y + colH + 50);
        ctx.fillText("APRÈS", 80 + colW + colW / 2, y + colH + 50);
      } else {
        const img = await loadImg(photo.photo_url);
        const size = 1000;
        const y = 200;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(40, y, W - 80, size, 32);
        ctx.clip();
        const ratio = Math.max((W - 80) / img.width, size / img.height);
        const dw = img.width * ratio;
        const dh = img.height * ratio;
        ctx.drawImage(img, 40 + ((W - 80) - dw) / 2, y + (size - dh) / 2, dw, dh);
        ctx.restore();
      }
    } catch {
      // ignore
    }

    // Top branding
    ctx.fillStyle = "#D4AF37";
    ctx.font = "bold 56px serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ Tableau de Board", W / 2, 100);
    ctx.fillStyle = "#F8F9FA";
    ctx.font = "300 28px sans-serif";
    ctx.fillText("Académie du Dressage", W / 2, 145);

    // Bottom: name + title
    const name = photo.display_name || "Chef anonyme";
    ctx.fillStyle = "#F8F9FA";
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Par ${name}`, W / 2, H - 180);
    if (photo.title) {
      ctx.fillStyle = "#D4AF37";
      ctx.font = "italic 32px serif";
      ctx.fillText(`« ${photo.title} »`, W / 2, H - 130);
    }
    ctx.fillStyle = "#888";
    ctx.font = "24px sans-serif";
    ctx.fillText("#TableauDeBoard #ArtDuDressage", W / 2, H - 70);

    return new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
  };

  const handleShare = async (photo: Photo) => {
    const blob = await generateShareImage(photo);
    if (!blob) {
      toast.error("Impossible de générer le visuel");
      return;
    }
    const fileToShare = new File([blob], "tableau-de-board.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
      try {
        await navigator.share({
          files: [fileToShare],
          title: "Mon dressage – Tableau de Board",
          text: "Découvre ma création sur Tableau de Board ✨ #ArtDuDressage",
        });
      } catch {
        // cancelled
      }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tableau-de-board-instagram.png";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Visuel téléchargé ! Publie-le sur Instagram 📸");
    }
    setShareTarget(null);
  };

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-[hsl(45,70%,55%)]" />
            <h2 className="font-display font-bold text-lg text-[hsl(45,60%,75%)]">Galerie des Chefs</h2>
          </div>
          <p className="text-xs text-[hsl(0,0%,60%)] max-w-xl">
            Partage ton dressage, inspire la communauté et reçois des toques de chef 👨‍🍳
          </p>
        </div>
        <Button
          onClick={() => setUploadOpen(true)}
          className="bg-[hsl(45,70%,50%)] hover:bg-[hsl(45,70%,45%)] text-[hsl(0,0%,10%)] font-semibold gap-2 rounded-full"
        >
          <Upload className="w-4 h-4" />
          Partager mon dressage
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-[hsl(45,70%,50%)]" />
        </div>
      ) : photos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[hsl(45,60%,40%,0.3)] bg-[hsl(0,0%,10%)] p-10 text-center">
          <ChefHat className="w-10 h-10 mx-auto text-[hsl(45,60%,55%)] mb-3" />
          <p className="text-sm text-[hsl(0,0%,70%)]">Sois le premier à partager ta création !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {photos.map((p) => {
            const lk = likes[p.id] || { count: 0, liked: false };
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden bg-[hsl(0,0%,12%)] border border-[hsl(45,60%,40%,0.25)] flex flex-col"
              >
                {p.is_challenge && p.before_photo_url ? (
                  <div className="relative">
                    <div className="grid grid-cols-2 gap-0.5 bg-[hsl(45,60%,40%,0.3)]">
                      <div className="relative aspect-square">
                        <img src={p.before_photo_url} alt="Avant" className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 bg-black/70 text-[hsl(0,0%,80%)] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Avant
                        </span>
                      </div>
                      <div className="relative aspect-square">
                        <img src={p.photo_url} alt="Après" className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 bg-[hsl(45,70%,50%)] text-[hsl(0,0%,10%)] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                          Après
                        </span>
                      </div>
                    </div>
                    <span className="absolute top-2 right-2 bg-[hsl(160,45%,45%)] text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Challenge
                    </span>
                  </div>
                ) : (
                  <div className="aspect-square overflow-hidden">
                    <img src={p.photo_url} alt={p.title || "Dressage"} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-3 flex-1 flex flex-col gap-2">
                  {p.title && <p className="text-sm font-display text-[hsl(45,60%,75%)] line-clamp-1">{p.title}</p>}
                  <p className="text-[11px] text-[hsl(0,0%,55%)]">
                    Par <span className="text-[hsl(0,0%,80%)]">{p.display_name || "Chef"}</span>
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <button
                      onClick={() => toggleLike(p.id)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${
                        lk.liked
                          ? "bg-[hsl(45,70%,50%,0.15)] text-[hsl(45,70%,60%)] ring-1 ring-[hsl(45,70%,50%,0.4)]"
                          : "text-[hsl(0,0%,60%)] hover:text-[hsl(45,70%,60%)] hover:bg-[hsl(45,70%,50%,0.08)]"
                      }`}
                    >
                      <ChefHat className={`w-4 h-4 ${lk.liked ? "fill-[hsl(45,70%,55%)]" : ""}`} />
                      <span className="font-semibold">{lk.count}</span>
                    </button>
                    <button
                      onClick={() => setShareTarget(p)}
                      className="flex items-center gap-1 text-xs text-[hsl(0,0%,60%)] hover:text-[hsl(45,70%,60%)] px-2 py-1.5 rounded-full"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Partager
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="bg-[hsl(0,0%,10%)] border-[hsl(45,60%,40%,0.3)] text-[hsl(0,0%,90%)]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(45,60%,75%)] font-display">Partager mon dressage</DialogTitle>
            <DialogDescription className="text-[hsl(0,0%,60%)]">
              Choisis un format et laisse parler ton talent.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode("single")}
              className={`p-3 rounded-xl border text-xs text-left transition-all ${
                mode === "single"
                  ? "border-[hsl(45,70%,50%)] bg-[hsl(45,70%,50%,0.1)]"
                  : "border-[hsl(0,0%,20%)] hover:border-[hsl(0,0%,30%)]"
              }`}
            >
              <p className="font-semibold mb-0.5">Photo simple</p>
              <p className="text-[10px] text-[hsl(0,0%,60%)]">Une création à montrer</p>
            </button>
            <button
              onClick={() => setMode("challenge")}
              className={`p-3 rounded-xl border text-xs text-left transition-all ${
                mode === "challenge"
                  ? "border-[hsl(45,70%,50%)] bg-[hsl(45,70%,50%,0.1)]"
                  : "border-[hsl(0,0%,20%)] hover:border-[hsl(0,0%,30%)]"
              }`}
            >
              <p className="font-semibold mb-0.5 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Challenge
              </p>
              <p className="text-[10px] text-[hsl(0,0%,60%)]">Avant / Après</p>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-[hsl(0,0%,70%)]">Titre (optionnel)</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                placeholder="Ex: Filet de bœuf au jus de truffe"
                className="bg-[hsl(0,0%,15%)] border-[hsl(0,0%,20%)] text-[hsl(0,0%,90%)] mt-1"
              />
            </div>

            {mode === "challenge" && (
              <div>
                <Label className="text-xs text-[hsl(0,0%,70%)]">Photo « Avant » (premier essai)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBeforeFile(e.target.files?.[0] || null)}
                  className="bg-[hsl(0,0%,15%)] border-[hsl(0,0%,20%)] text-[hsl(0,0%,90%)] mt-1 file:text-[hsl(45,60%,70%)]"
                />
              </div>
            )}

            <div>
              <Label className="text-xs text-[hsl(0,0%,70%)]">
                {mode === "challenge" ? "Photo « Après » (post-cours)" : "Ta photo"}
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="bg-[hsl(0,0%,15%)] border-[hsl(0,0%,20%)] text-[hsl(0,0%,90%)] mt-1 file:text-[hsl(45,60%,70%)]"
              />
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-[hsl(45,70%,50%)] hover:bg-[hsl(45,70%,45%)] text-[hsl(0,0%,10%)] font-semibold gap-2"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Publier
          </Button>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={!!shareTarget} onOpenChange={(o) => !o && setShareTarget(null)}>
        <DialogContent className="bg-[hsl(0,0%,10%)] border-[hsl(45,60%,40%,0.3)] text-[hsl(0,0%,90%)]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(45,60%,75%)] font-display">Partager sur Instagram</DialogTitle>
            <DialogDescription className="text-[hsl(0,0%,60%)]">
              On te génère un visuel stylisé prêt à publier ✨
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => shareTarget && handleShare(shareTarget)}
            className="bg-gradient-to-r from-[hsl(45,70%,50%)] to-[hsl(35,80%,55%)] text-[hsl(0,0%,10%)] font-semibold gap-2"
          >
            <Share2 className="w-4 h-4" />
            Générer & partager
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}
