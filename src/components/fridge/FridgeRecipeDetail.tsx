import { Recipe } from "@/data/recipes";
import { Clock, Flame, Dumbbell, Wheat } from "lucide-react";
import { useNutrition } from "@/context/NutritionContext";

interface FridgeRecipeDetailProps {
  recipe: Recipe;
  missingIngredients?: string[];
}

export function FridgeRecipeDetail({ recipe, missingIngredients }: FridgeRecipeDetailProps) {
  const { mode } = useNutrition();
  const isHealthy = recipe.healthy && mode === "perte";

  return (
    <div className={`glass-card-solid rounded-2xl p-5 space-y-4 ${isHealthy ? "ring-2 ring-emerald/30" : ""}`}>
      <div className="flex items-start gap-3">
        <span className="text-4xl">{recipe.image}</span>
        <div className="flex-1">
          <h3 className="text-lg font-display font-semibold">{recipe.name}</h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{recipe.prepTime}</span>
            <span className={`flex items-center gap-1 ${isHealthy ? "text-emerald font-medium" : ""}`}>
              <Flame className="w-3 h-3" />{recipe.calories} kcal
            </span>
            <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" />{recipe.protein}g prot</span>
            <span className="flex items-center gap-1"><Wheat className="w-3 h-3" />{recipe.carbs}g gluc</span>
          </div>
          {isHealthy && (
            <span className="inline-block mt-1 text-[10px] font-semibold text-emerald bg-emerald/10 rounded-full px-2 py-0.5">
              ✓ {mode === "perte" ? "Perte de poids" : "Prise de masse"}
            </span>
          )}
        </div>
      </div>

      {missingIngredients && missingIngredients.length > 0 && (
        <div className="bg-destructive/10 text-destructive rounded-xl px-4 py-2 text-sm">
          <span className="font-semibold">Ingrédients manquants :</span>{" "}
          {missingIngredients.join(", ")}
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold mb-2">Ingrédients</h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {recipe.ingredients.map((ing) => {
            const isMissing = missingIngredients?.some(
              (m) => ing.name.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(ing.name.toLowerCase())
            );
            return (
              <li key={ing.name} className={`text-sm flex items-center gap-2 ${isMissing ? "text-destructive" : "text-muted-foreground"}`}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: isMissing ? "hsl(var(--destructive))" : "hsl(var(--primary))" }} />
                <span className="font-medium">{ing.quantity}</span> {ing.name}
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Préparation</h4>
        <ol className="space-y-2">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-cobalt text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
