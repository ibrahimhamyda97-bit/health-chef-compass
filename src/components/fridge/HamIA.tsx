import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNutrition } from "@/context/NutritionContext";
import { AIRecipeDetail, AIRecipe } from "@/components/AIRecipeDetail";
import hamiaAvatar from "@/assets/hamia-avatar.png";

interface HamIAProps {
  fridgeItems: string[];
}

export function HamIA({ fridgeItems }: HamIAProps) {
  const { mode } = useNutrition();
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<(AIRecipe & { hamia_tip?: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateRecipe = async () => {
    if (fridgeItems.length === 0) return;
    setLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("fridge-recipe", {
        body: { ingredients: fridgeItems, mode },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.recipe) throw new Error("Aucune recette générée");

      setRecipe(data.recipe);
    } catch (e: any) {
      console.error("HamIA error:", e);
      setError(e.message || "Erreur lors de la génération");
    } finally {
      setLoading(false);
    }
  };

  if (recipe) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <img src={hamiaAvatar} alt="HamIA" className="w-10 h-10 rounded-full ring-2 ring-primary/30" width={40} height={40} />
          <div>
            <p className="text-sm font-semibold text-primary">HamIA</p>
            <p className="text-xs text-muted-foreground">Voici ma suggestion pour vous !</p>
          </div>
        </div>

        {recipe.hamia_tip && (
          <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-xl p-4">
            <ChefHat className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80 italic">💡 Conseil de HamIA : {recipe.hamia_tip}</p>
          </div>
        )}

        <AIRecipeDetail recipe={recipe} onBack={() => setRecipe(null)} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-solid rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center gap-4">
        <img
          src={hamiaAvatar}
          alt="HamIA"
          className="w-14 h-14 rounded-full ring-2 ring-primary/30 shadow-lg"
          width={56}
          height={56}
        />
        <div className="flex-1">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            HamIA
            <Sparkles className="w-4 h-4 text-primary" />
          </h3>
          <p className="text-sm text-muted-foreground">
            Votre cheffe IA personnelle. Je crée une recette sur-mesure avec vos ingrédients !
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-destructive bg-destructive/10 rounded-lg p-3"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {fridgeItems.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Ingrédients détectés : <span className="font-medium text-foreground">{fridgeItems.join(", ")}</span>
          </p>
          <Button
            onClick={generateRecipe}
            disabled={loading}
            className="w-full gradient-cobalt text-primary-foreground rounded-xl py-3 h-auto font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                HamIA réfléchit...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Demander à HamIA
              </>
            )}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          Ajoutez des ingrédients ci-dessus pour que je puisse vous proposer un plat !
        </p>
      )}
    </motion.div>
  );
}
