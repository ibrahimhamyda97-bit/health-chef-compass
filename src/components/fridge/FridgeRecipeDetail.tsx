import { Recipe } from "@/data/recipes";
import { Clock, Flame, Dumbbell, Wheat, ShoppingCart, Check } from "lucide-react";
import { useNutrition } from "@/context/NutritionContext";
import { useState } from "react";
import { toast } from "sonner";

interface FridgeRecipeDetailProps {
  recipe: Recipe;
  missingIngredients?: string[];
}

export function FridgeRecipeDetail({ recipe, missingIngredients }: FridgeRecipeDetailProps) {
  const { mode, addShoppingItems } = useNutrition();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const isHealthy = recipe.healthy && mode === "perte";

  const missingWithQuantity = missingIngredients
    ? recipe.ingredients.filter((ing) =>
        missingIngredients.some(
          (m) => ing.name.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(ing.name.toLowerCase())
        )
      )
    : [];

  const handleAddToShoppingList = (name: string, quantity: string) => {
    addShoppingItems([{ name, quantity }]);
    setAddedItems((prev) => new Set(prev).add(name));
    toast.success(`${name} ajouté à la liste de courses`);
  };

  const handleAddAllMissing = () => {
    const items = missingWithQuantity.map((ing) => ({ name: ing.name, quantity: ing.quantity }));
    addShoppingItems(items);
    setAddedItems((prev) => {
      const next = new Set(prev);
      items.forEach((i) => next.add(i.name));
      return next;
    });
    toast.success(`${items.length} ingrédient${items.length > 1 ? "s" : ""} ajouté${items.length > 1 ? "s" : ""} à la liste`);
  };

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

      {missingWithQuantity.length > 0 && (
        <div className="bg-destructive/10 rounded-xl px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-destructive">
              Ingrédients manquants ({missingWithQuantity.length})
            </span>
            <button
              onClick={handleAddAllMissing}
              className="text-xs font-medium bg-primary text-primary-foreground rounded-full px-3 py-1 hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              <ShoppingCart className="w-3 h-3" />
              Tout ajouter à la liste
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingWithQuantity.map((ing) => {
              const isAdded = addedItems.has(ing.name);
              return (
                <button
                  key={ing.name}
                  onClick={() => !isAdded && handleAddToShoppingList(ing.name, ing.quantity)}
                  disabled={isAdded}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    isAdded
                      ? "bg-emerald/10 text-emerald cursor-default"
                      : "bg-background text-destructive hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  }`}
                >
                  {isAdded ? <Check className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
                  {ing.quantity} {ing.name}
                </button>
              );
            })}
          </div>
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
