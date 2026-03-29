import { useNutrition } from "@/context/NutritionContext";
import { recipes } from "@/data/recipes";
import { NutritionCircle } from "@/components/NutritionCircle";
import { RecipeCard } from "@/components/RecipeCard";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, Flame, Beef, Apple } from "lucide-react";
import { motion } from "framer-motion";

export default function Overview() {
  const { mode, setMode } = useNutrition();
  const sortedRecipes = mode === "perte"
    ? [...recipes].sort((a, b) => a.calories - b.calories)
    : [...recipes].sort((a, b) => b.protein - a.protein);

  const topRecipes = sortedRecipes.slice(0, 4);
  const totalCalories = 1850;
  const goalCalories = mode === "perte" ? 1800 : 2800;

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Bonjour 👋</h1>
          <p className="text-muted-foreground">Voici votre résumé nutritionnel du jour.</p>
        </div>
        <div className="flex items-center gap-3 glass-card-solid rounded-2xl px-4 py-3">
          <span className={`text-sm font-medium ${mode === "perte" ? "text-emerald" : "text-muted-foreground"}`}>Perte</span>
          <Switch
            checked={mode === "masse"}
            onCheckedChange={(c) => setMode(c ? "masse" : "perte")}
          />
          <span className={`text-sm font-medium ${mode === "masse" ? "text-cobalt" : "text-muted-foreground"}`}>Masse</span>
        </div>
      </motion.div>

      {/* Stats cards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Calories", value: `${totalCalories}`, unit: `/ ${goalCalories} kcal`, icon: Flame, color: "text-orange-500" },
          { label: "Protéines", value: "92g", unit: "/ 120g", icon: Beef, color: "text-cobalt" },
          { label: "Glucides", value: "180g", unit: "/ 250g", icon: Apple, color: "text-emerald" },
          { label: "Objectif", value: mode === "perte" ? "72%" : "55%", unit: "atteint", icon: TrendingUp, color: "text-cobalt" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card-solid rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
            </div>
            <div>
              <span className="text-xl font-display font-bold">{stat.value}</span>
              <span className="text-xs text-muted-foreground ml-1">{stat.unit}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Recommended recipes */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-lg font-display font-semibold mb-4">
          {mode === "perte" ? "🥗 Recettes légères recommandées" : "💪 Recettes riches en protéines"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </motion.div>

      {/* Nutrition summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card-solid rounded-2xl p-6">
        <h2 className="text-lg font-display font-semibold mb-4">Répartition Nutritionnelle</h2>
        <div className="flex flex-wrap justify-center gap-8">
          <NutritionCircle label="Calories" value={totalCalories} max={goalCalories} unit="kcal" color="hsl(25, 95%, 53%)" />
          <NutritionCircle label="Protéines" value={92} max={120} unit="g" color="hsl(220, 70%, 50%)" />
          <NutritionCircle label="Glucides" value={180} max={250} unit="g" color="hsl(155, 60%, 45%)" />
          <NutritionCircle label="Lipides" value={55} max={70} unit="g" color="hsl(280, 60%, 55%)" />
        </div>
      </motion.div>
    </div>
  );
}
