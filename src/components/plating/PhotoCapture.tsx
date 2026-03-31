import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PhotoCaptureProps {
  courseTitle: string;
  courseImage: string;
}

export default function PhotoCapture({ courseTitle, courseImage }: PhotoCaptureProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleShare = async () => {
    if (!photo) return;
    if (navigator.share) {
      try {
        const blob = await fetch(photo).then((r) => r.blob());
        const file = new File([blob], "mon-dressage.jpg", { type: blob.type });
        await navigator.share({ title: courseTitle, text: "Mon dressage HaMenu !", files: [file] });
      } catch {
        toast.info("Partage annulé");
      }
    } else {
      await navigator.clipboard.writeText("Mon dressage HaMenu – " + courseTitle);
      toast.success("Lien copié !");
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      {!photo ? (
        <Button
          onClick={() => inputRef.current?.click()}
          className="w-full h-10 rounded-full bg-[hsl(160,45%,45%)] hover:bg-[hsl(160,45%,40%)] text-white text-xs font-semibold gap-2"
        >
          <Camera className="w-4 h-4" />
          J'ai dressé mon plat ! Prendre ma photo
        </Button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Comparison */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground text-center uppercase tracking-wide">Modèle du Chef</p>
                <img src={courseImage} alt="Modèle" className="rounded-xl w-full h-28 object-cover border border-[hsl(45,60%,40%,0.3)]" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground text-center uppercase tracking-wide">Ma Création</p>
                <img src={photo} alt="Ma création" className="rounded-xl w-full h-28 object-cover border border-[hsl(160,45%,45%,0.5)]" />
              </div>
            </div>

            {/* Congrats */}
            <div className="text-center space-y-1">
              <p className="text-sm font-display font-semibold text-[hsl(160,45%,55%)]">
                🎉 Superbe dressage ! Tu progresses !
              </p>
              <p className="text-[10px] text-muted-foreground">— HaMenu</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleShare}
                className="flex-1 h-8 rounded-full bg-[hsl(160,45%,45%)] hover:bg-[hsl(160,45%,40%)] text-white text-xs gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Partager
              </Button>
              <Button
                variant="ghost"
                onClick={() => setPhoto(null)}
                className="h-8 rounded-full text-xs text-muted-foreground gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Refaire
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
