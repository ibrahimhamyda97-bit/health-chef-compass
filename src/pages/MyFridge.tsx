import { useState, KeyboardEvent } from "react";
import { useNutrition } from "@/context/NutritionContext";
import { recipes } from "@/data/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import { X, Plus, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

// Common ingredients that pair well
const ingredientSuggestions: Record<string, string[]> = {
  poulet: ["riz", "citron", "oignon", "ail", "crème"],
  riz: ["poulet", "saumon", "sauce soja", "légumes", "oignon"],
  tomate: ["mozzarella", "basilic", "oignon", "ail", "huile d'olive"],
  avocat: ["citron", "crevettes", "mangue", "oignon rouge", "coriandre"],
  saumon: ["citron", "aneth", "riz", "avocat", "sauce soja"],
  oeuf: ["fromage", "épinards", "oignon", "crème", "beurre"],
  pâtes: ["tomate", "parmesan", "ail", "basilic", "crème"],
  boeuf: ["oignon", "tomate", "pomme de terre", "ail", "poivron"],
  fromage: ["pain", "tomate", "salade", "oeuf", "jambon"],
  salade: ["tomate", "concombre", "poulet", "avocat", "vinaigrette"],
};

export default function MyFridge() {
  const { fridgeItems, addFridgeItem, removeFridgeItem } = useNutrition();
  const [input, setInput] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      addFridgeItem(input);
      setInput("");
    }
  };

  // Match recipes where ALL recipe ingredients are found in the fridge
  const matchedRecipes = fridgeItems.length > 0
    ? recipes.filter((r) => {
        const fridgeLower = fridgeItems.map((f) => f.toLowerCase());
        return r.ingredients.every((ing) =>
          fridgeLower.some((f) => ing.name.toLowerCase().includes(f) || f.includes(ing.name.toLowerCase()))
        );
      })
    : [];

  // Partial matches: recipes where most ingredients are in the fridge but some are missing
  const partialMatches = fridgeItems.length > 0
    ? recipes.filter((r) => {
        const fridgeLower = fridgeItems.map((f) => f.toLowerCase());
        const matchCount = r.ingredients.filter((ing) =>
          fridgeLower.some((f) => ing.name.toLowerCase().includes(f) || f.includes(ing.name.toLowerCase()))
        ).length;
        return matchCount > 0 && matchCount < r.ingredients.length && !matchedRecipes.includes(r);
      })
    : [];

  // Generate ingredient suggestions based on what's in the fridge
  const suggestions = fridgeItems.length > 0
    ? Array.from(
        new Set(
          fridgeItems.flatMap((item) => {
            const key = Object.keys(ingredientSuggestions).find(
              (k) => item.toLowerCase().includes(k) || k.includes(item.toLowerCase())
            );
            return key ? ingredientSuggestions[key] : [];
          })
        )
      ).filter((s) => !fridgeItems.some((f) => f.toLowerCase() === s.toLowerCase())).slice(0, 6)
    : [];

  // For partial matches, show which recipe ingredients are NOT in the fridge
  const getMissingIngredients = (r: typeof recipes[0]) => {
    const fridgeLower = fridgeItems.map((f) => f.toLowerCase());
    return r.ingredients
      .filter((ing) => !fridgeLower.some((f) => ing.name.toLowerCase().includes(f) || f.includes(ing.name.toLowerCase())))
      .map((ing) => ing.name);
  };

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
            onClick={() => { if (input.trim()) { addFridgeItem(input); setInput(""); } }}
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

        {/* Ingredient suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-primary" />
              Suggestions pour améliorer vos plats :
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => addFridgeItem(s)}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                  <Plus className="w-3 h-3" /> {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Exact matches */}
      {matchedRecipes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-display font-semibold mb-3">
            🎯 {matchedRecipes.length} plat{matchedRecipes.length > 1 ? "s" : ""} avec vos ingrédients uniquement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchedRecipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} highlight />
            ))}
          </div>
        </motion.div>
      )}

      {/* Partial matches with missing ingredient info */}
      {partialMatches.length > 0 && matchedRecipes.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-display font-semibold mb-3">
            🍳 {partialMatches.length} plat{partialMatches.length > 1 ? "s" : ""} partiellement possible{partialMatches.length > 1 ? "s" : ""}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partialMatches.slice(0, 6).map((r) => {
              const missing = getMissingIngredients(r);
              return (
                <div key={r.id} className="space-y-1">
                  <RecipeCard recipe={r} />
                  {missing.length > 0 && (
                    <p className="text-[10px] text-muted-foreground px-2">
                      ⚠️ Ne contient pas : {missing.join(", ")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {fridgeItems.length > 0 && matchedRecipes.length === 0 && partialMatches.length === 0 && (
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
