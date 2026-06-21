import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  accept: "image/*" | "video/*";
  label: string;
  onUploaded: (signedUrl: string) => void;
  maxMb?: number;
}

const ONE_YEAR_SEC = 60 * 60 * 24 * 365;

export default function MediaUploadButton({ accept, label, onUploaded, maxMb = 200 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`Fichier trop volumineux (max ${maxMb} Mo)`);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Connecte-toi pour uploader"); return; }

    setUploading(true);
    setProgress(10);
    const ext = file.name.split(".").pop() || (accept === "image/*" ? "jpg" : "mp4");
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: upErr } = await supabase.storage.from("pastry-media").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (upErr) {
      toast.error("Erreur d'upload: " + upErr.message);
      setUploading(false);
      return;
    }
    setProgress(80);
    const { data: signed, error: signErr } = await supabase.storage
      .from("pastry-media")
      .createSignedUrl(path, ONE_YEAR_SEC);
    if (signErr || !signed) {
      toast.error("Erreur URL signée: " + (signErr?.message ?? ""));
      setUploading(false);
      return;
    }
    onUploaded(signed.signedUrl);
    setProgress(100);
    setUploading(false);
    toast.success("Fichier uploadé !");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="inline-flex items-center gap-2">
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="gap-1.5"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        {uploading ? `Upload... ${progress}%` : label}
      </Button>
    </div>
  );
}
