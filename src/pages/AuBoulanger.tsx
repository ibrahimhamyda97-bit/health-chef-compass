import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CakeSlice, Plus, MapPin, Loader2, Trash2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface CakeListing {
  id: string;
  user_id: string;
  photo_url: string;
  title: string;
  description: string | null;
  price: number;
  country: string;
  city: string;
  created_at: string;
}

export default function AuBoulanger() {
  const { user } = useAuth();
  const [listings, setListings] = useState<CakeListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const fetchListings = async () => {
    const { data } = await supabase
      .from("cake_listings")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setListings(data as CakeListing[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Connectez-vous pour publier un gâteau.");
      return;
    }
    if (!photoFile || !title.trim() || !price.trim()) {
      toast.error("Photo, titre et prix sont obligatoires.");
      return;
    }

    setUploading(true);
    try {
      const ext = photoFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("cake-photos")
        .upload(filePath, photoFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("cake-photos")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("cake_listings").insert({
        user_id: user.id,
        photo_url: urlData.publicUrl,
        title: title.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        country: country.trim(),
        city: city.trim(),
      });
      if (insertError) throw insertError;

      toast.success("Gâteau publié avec succès !");
      setTitle("");
      setDescription("");
      setPrice("");
      setCountry("");
      setCity("");
      setPhotoFile(null);
      setPhotoPreview(null);
      setDialogOpen(false);
      fetchListings();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erreur lors de la publication.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("cake_listings").delete().eq("id", id);
    if (error) {
      toast.error("Erreur lors de la suppression.");
    } else {
      toast.success("Annonce supprimée.");
      setListings((prev) => prev.filter((l) => l.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <CakeSlice className="w-6 h-6 text-primary" /> Au Boulanger 🥐
          </h1>
          <p className="text-muted-foreground text-sm">Vendez et découvrez des gâteaux faits maison.</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-cobalt text-primary-foreground rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Publier un gâteau
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Publier un gâteau</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {/* Photo upload */}
              <label className="block cursor-pointer">
                <div className="w-full h-48 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-secondary/50 hover:bg-secondary transition-colors">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ImagePlus className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Cliquez pour ajouter une photo</p>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>

              <Input
                placeholder="Nom du gâteau *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl"
              />
              <Textarea
                placeholder="Description (optionnelle)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl min-h-[80px]"
              />
              <Input
                type="number"
                placeholder="Prix (€) *"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-xl"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Pays"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="rounded-xl"
                />
                <Input
                  placeholder="Ville"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={uploading}
                className="w-full gradient-cobalt text-primary-foreground rounded-xl py-3 h-auto font-semibold"
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publication...</>
                ) : (
                  "Publier"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Listings grid */}
      {loading ? (
        <p className="text-center text-muted-foreground py-12">Chargement...</p>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-5xl mb-3">🎂</p>
          <p className="font-display font-semibold">Aucun gâteau en vente pour le moment.</p>
          <p className="text-sm mt-1">Soyez le premier à publier !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card-solid rounded-2xl overflow-hidden group"
            >
              <div
                className="w-full h-48 overflow-hidden cursor-zoom-in"
                onClick={() => setZoomedPhoto(listing.photo_url)}
              >
                <img
                  src={listing.photo_url}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-sm">{listing.title}</h3>
                  <span className="text-primary font-bold text-lg">{listing.price} €</span>
                </div>
                {listing.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{listing.description}</p>
                )}
                {(listing.city || listing.country) && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {[listing.city, listing.country].filter(Boolean).join(", ")}
                  </p>
                )}
                {user && user.id === listing.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(listing.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs mt-1"
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Supprimer
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Zoom dialog */}
      <Dialog open={!!zoomedPhoto} onOpenChange={() => setZoomedPhoto(null)}>
        <DialogContent className="max-w-3xl p-2">
          {zoomedPhoto && <img src={zoomedPhoto} alt="Zoom" className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
