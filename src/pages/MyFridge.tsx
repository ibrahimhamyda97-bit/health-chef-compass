import { useState, KeyboardEvent } from "react";
import { useNutrition } from "@/context/NutritionContext";
import { recipes } from "@/data/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function MyFridge() {
  const { fridgeItems, addFridgeItem, removeFridgeItem } = useNutrition();
  const [input, setInput] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      addFridgeItem(input);
      setInput("");
    }
  };

  const matchedRecipes = fridgeItems.length > 0
    ? recipes.filter((r) =>
        fridgeItems.some((item) =>
          r.tags.some((tag) => tag.includes(item) || item.includes(tag))
        )
      )
    : [];

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Mon Frigo 🧊</h1>
        <p className="text-muted-foreground text-sm">Ajoutez vos ingrédients pour découvrir les plats possibles.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-solid rounded-2xl p-5 space-y-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tapez un ingrédient et appuyez sur Entrée..."
            className="rounded-xl bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <button
            onClick={() => { addFridgeItem(input); setInput(""); }}
            className="shrink-0 w-10 h-10 rounded-xl gradient-cobalt flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {fridgeItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {fridgeItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 bg-secondary rounded-full px-3 py-1.5 text-sm font-medium"
              >
                {item}
                <button onClick={() => removeFridgeItem(item)} className="hover:text-destructive transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {matchedRecipes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-display font-semibold mb-3">
            🍳 {matchedRecipes.length} plat{matchedRecipes.length > 1 ? "s" : ""} possible{matchedRecipes.length > 1 ? "s" : ""}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchedRecipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} highlight />
            ))}
          </div>
        </motion.div>
      )}

      {fridgeItems.length > 0 && matchedRecipes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-2">🤔</p>
          <p>Aucune recette trouvée avec ces ingrédients. Essayez d'en ajouter d'autres !</p>
        </div>
      )}

      {fridgeItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-2">🥕</p>
          <p>Ajoutez des ingrédients pour commencer !</p>
          <p className="text-xs mt-1">Exemples : poulet, riz, tomate, avocat...</p>
        </div>
      )}
    </div>
  );
}
