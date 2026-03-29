import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { recipes, Recipe } from "@/data/recipes";
import { NutritionCircle } from "@/components/NutritionCircle";
import { RecipeCard } from "@/components/RecipeCard";
import { Input } from "@/components/ui/input";
import { useNutrition } from "@/context/NutritionContext";
import { Search, Minus, Plus, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

function countMatchingTags(recipe: Recipe, items: string[]): number {
  if (items.length === 0) return 0;
  return recipe.tags.filter((tag) =>
    items.some((item) => tag.includes(item) || item.includes(tag))
  ).length;
}

export default function RecipeSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("id");
  const [query, setQuery] = useState("");
  const [servings, setServings] = useState(1);
  const { fridgeItems } = useNutrition();

  const allRecipes = useMemo(() => {
    const saved = localStorage.getItem("nutridash-custom-recipes");
    if (saved) {
      try { return [...recipes, ...JSON.parse(saved)]; } catch { /* ignore */ }
    }
    return recipes;
  }, []);

  const filtered = useMemo(() => {
    let list = query.trim()
      ? allRecipes.filter((r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.tags.some((t) => t.includes(query.toLowerCase())) ||
          r.ingredients.some((ing) => ing.name.toLowerCase().includes(query.toLowerCase()))
        )
      : allRecipes;

    if (fridgeItems.length > 0 && !query.trim()) {
      list = [...list].sort((a, b) => countMatchingTags(b, fridgeItems) - countMatchingTags(a, fridgeItems));
    }

    return list;
  }, [query, fridgeItems, allRecipes]);

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return allRecipes
      .filter((r) => r.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [query, allRecipes]);

  const selected = selectedId ? recipes.find((r) => r.id === selectedId) : null;

  if (selected) {
    const ratio = servings / selected.servings;
    return (
      <div className="space-y-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => setSearchParams({})} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">{selected.image}</span>
            <div>
              <h1 className="text-2xl font-display font-bold">{selected.name}</h1>
              <p className="text-sm text-muted-foreground">{selected.prepTime} · {Math.round(selected.calories * ratio)} kcal</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ingredients */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card-solid rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold">Ingrédients</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setServings(Math.max(1, servings - 1))} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-medium w-16 text-center">{servings} portion{servings > 1 ? "s" : ""}</span>
                <button onClick={() => setServings(servings + 1)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <ul className="space-y-2">
              {selected.ingredients.map((ing, i) => (
                <li key={i} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                  <span>{ing.name}</span>
                  <span className="text-muted-foreground font-medium">{ing.quantity}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Steps */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass-card-solid rounded-2xl p-5">
            <h2 className="font-display font-semibold mb-4">Préparation</h2>
            <ol className="space-y-4">
              {selected.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full gradient-cobalt text-primary-foreground text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  <p className="text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>

        {/* Nutrition footer */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card-solid rounded-2xl p-6">
          <h2 className="font-display font-semibold mb-4 text-center">Valeurs Nutritionnelles ({servings} portion{servings > 1 ? "s" : ""})</h2>
          <div className="flex flex-wrap justify-center gap-8">
            <NutritionCircle label="Calories" value={Math.round(selected.calories * ratio)} max={2000} unit="kcal" color="hsl(25, 95%, 53%)" />
            <NutritionCircle label="Protéines" value={Math.round(selected.protein * ratio)} max={60} unit="g" color="hsl(220, 70%, 50%)" />
            <NutritionCircle label="Glucides" value={Math.round(selected.carbs * ratio)} max={100} unit="g" color="hsl(155, 60%, 45%)" />
            <NutritionCircle label="Lipides" value={Math.round(selected.fat * ratio)} max={50} unit="g" color="hsl(280, 60%, 55%)" />
          </div>
        </motion.div>
      </div>
    );
  }

  const hasIngredients = fridgeItems.length > 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Recherche Recette 🔍</h1>
        <p className="text-muted-foreground text-sm">
          {hasIngredients && !query.trim()
            ? `Triées par correspondance avec vos ${fridgeItems.length} ingrédient(s) du frigo.`
            : "Trouvez et explorez des recettes détaillées."}
        </p>
      </motion.div>

      <div className="flex gap-2 max-w-md relative">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un plat, ingrédient..."
            className="pl-9 rounded-xl bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
          {suggestions.length > 0 && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl shadow-lg border border-border z-20 overflow-hidden">
              {suggestions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setQuery(""); setSearchParams({ id: r.id }); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <span>{r.image}</span>
                  <span>{r.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{r.calories} kcal</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => setQuery(query)}
          className="shrink-0 px-4 rounded-xl gradient-cobalt text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-1.5"
        >
          <Search className="w-4 h-4" />
          Rechercher
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => {
          const matchCount = countMatchingTags(r, fridgeItems);
          return (
            <div key={r.id} className="relative">
              {hasIngredients && matchCount > 0 && !query.trim() && (
                <span className="absolute -top-2 -right-2 z-10 text-[10px] font-bold bg-emerald-soft text-emerald px-2 py-0.5 rounded-full">
                  {matchCount} match{matchCount > 1 ? "s" : ""}
                </span>
              )}
              <RecipeCard recipe={r} highlight={hasIngredients && matchCount > 0 && !query.trim()} />
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-2">🔍</p>
          <p>Aucune recette trouvée pour "{query}"</p>
        </div>
      )}
    </div>
  );
}
