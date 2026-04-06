import { useState } from "react";
import { useNutrition } from "@/context/NutritionContext";
import { recipes, Recipe } from "@/data/recipes";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { FridgeInput } from "@/components/fridge/FridgeInput";
import { FridgeRecipeDetail } from "@/components/fridge/FridgeRecipeDetail";
import { FridgeFallback } from "@/components/fridge/FridgeFallback";
import { HamIA } from "@/components/fridge/HamIA";

function ingredientMatches(ingredientName: string, fridgeItems: string[]): boolean {
  const name = ingredientName.toLowerCase();
  return fridgeItems.some((item) => name.includes(item) || item.includes(name));
}

interface SimilarMatch {
  recipe: Recipe;
  matched: number;
  total: number;
  missingIngredients: string[];
}

export default function MyFridge() {
  const { fridgeItems, addFridgeItem, removeFridgeItem, mode } = useNutrition();
  const [searchTriggered, setSearchTriggered] = useState(false);

  const fridgeLower = fridgeItems.map((i) => i.toLowerCase().trim());

  // Filter by nutrition mode
  const modeFilteredRecipes = recipes.filter((r) => {
    if (mode === "perte") return r.calories <= 600;
    if (mode === "masse") return r.protein >= 20;
    return true;
  });

  // Exact matches: every ingredient in recipe is covered by fridge
  const exactMatches = fridgeLower.length > 0
    ? modeFilteredRecipes.filter((r) =>
        r.ingredients.every((ing) => ingredientMatches(ing.name, fridgeLower))
      )
    : [];

  // Similar matches: at least 2 ingredients match, but not all
  const similarMatches: SimilarMatch[] = fridgeLower.length > 0
    ? modeFilteredRecipes
        .filter((r) => !exactMatches.includes(r))
        .map((r) => {
          const matched = r.ingredients.filter((ing) => ingredientMatches(ing.name, fridgeLower)).length;
          const missing = r.ingredients
            .filter((ing) => !ingredientMatches(ing.name, fridgeLower))
            .map((ing) => ing.name);
          return { recipe: r, matched, total: r.ingredients.length, missingIngredients: missing };
        })
        .filter((m) => m.matched >= 2)
        .sort((a, b) => (b.matched / b.total) - (a.matched / a.total))
        .slice(0, 6)
    : [];

  const noResults = exactMatches.length === 0 && similarMatches.length === 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Mon Frigo 🧊</h1>
        <p className="text-muted-foreground text-sm">
          Ajoutez vos ingrédients pour découvrir les plats possibles.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card-solid rounded-2xl p-5 space-y-4"
      >
        <FridgeInput
          fridgeItems={fridgeItems}
          addFridgeItem={addFridgeItem}
          removeFridgeItem={removeFridgeItem}
          onItemsChanged={() => setSearchTriggered(false)}
        />

        {fridgeItems.length > 0 && (
          <button
            onClick={() => setSearchTriggered(true)}
            className="w-full py-3 rounded-xl gradient-cobalt text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-95"
          >
            <Search className="w-4 h-4" />
            Rechercher des plats
          </button>
        )}
      </motion.div>

      {searchTriggered && exactMatches.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <h2 className="text-lg font-display font-semibold">
            🎯 {exactMatches.length} plat{exactMatches.length > 1 ? "s" : ""} réalisable{exactMatches.length > 1 ? "s" : ""} avec vos ingrédients
          </h2>
          {exactMatches.map((recipe) => (
            <FridgeRecipeDetail key={recipe.id} recipe={recipe} />
          ))}
        </motion.div>
      )}

      {searchTriggered && similarMatches.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
          <h2 className="text-lg font-display font-semibold">
            🔍 Plats similaires
          </h2>
          <p className="text-sm text-muted-foreground -mt-2">
            Ces plats utilisent certains de vos ingrédients. Les ingrédients manquants sont indiqués.
          </p>
          {similarMatches.map(({ recipe, missingIngredients }) => (
            <FridgeRecipeDetail key={recipe.id} recipe={recipe} missingIngredients={missingIngredients} />
          ))}
        </motion.div>
      )}

      {searchTriggered && noResults && fridgeItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <FridgeFallback fridgeItems={fridgeItems} />
        </motion.div>
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
