import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AIRecipeDetail, AIRecipe } from "@/components/AIRecipeDetail";
import hamiaAvatar from "@/assets/hamia-avatar.png";
import { toast } from "sonner";

export default function RecipeSearch() {
  const [query, setQuery] = useState("");
  const [aiRecipe, setAiRecipe] = useState<AIRecipe | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q || q.length < 2) {
      toast.error("Entrez au moins 2 caractères.");
      return;
    }
    setAiLoading(true);
    setAiRecipe(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-recipe", {
        body: { dishName: q, servings: 4 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiRecipe(data.recipe);
    } catch (e: any) {
      console.error("AI search error:", e);
      toast.error(e.message || "Erreur lors de la génération.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  if (aiRecipe) {
    return <AIRecipeDetail recipe={aiRecipe} onBack={() => setAiRecipe(null)} />;
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="flex justify-center mb-4">
          <img src={hamiaAvatar} alt="HamIA" className="w-16 h-16 rounded-full ring-2 ring-primary/30 shadow-lg" />
        </div>
        <h1 className="text-2xl font-display font-bold flex items-center justify-center gap-2">
          Trouver Une Recette
          <Sparkles className="w-5 h-5 text-primary" />
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Demandez n'importe quel plat du monde à HamIA, elle génère la recette complète !
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mafé, Sushi, Tiramisu, Croissant..."
              className="pl-9 rounded-xl bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary h-12"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={aiLoading}
            className="shrink-0 rounded-xl gradient-cobalt text-primary-foreground font-medium h-12 px-5 gap-2"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {aiLoading ? "Recherche..." : "Chercher"}
          </Button>
        </div>
      </motion.div>

      {aiLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-solid rounded-2xl p-10 text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-primary" />
          <p className="font-display font-semibold">HamIA prépare votre recette...</p>
          <p className="text-sm text-muted-foreground mt-1">Génération de « {query} » en cours</p>
        </motion.div>
      )}

      {!aiLoading && !aiRecipe && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center py-8 text-muted-foreground">
          <p className="text-5xl mb-3">🍽️</p>
          <p className="text-sm">Tapez le nom d'un plat et laissez HamIA faire le reste.</p>
        </motion.div>
      )}
    </div>
  );
}
