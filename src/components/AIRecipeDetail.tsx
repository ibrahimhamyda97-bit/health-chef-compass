import { useState } from "react";
import { Minus, Plus, ArrowLeft, ShoppingCart, Printer, Maximize, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { NutritionCircle } from "@/components/NutritionCircle";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNutrition } from "@/context/NutritionContext";

export interface AIRecipe {
  name: string;
  image_emoji: string;
  prepTime: string;
  cookTime: string;
  difficulty: string;
  servings: number;
  description: string;
  ingredients: { name: string; quantity: number; unit: string }[];
  steps: string[];
  nutrition: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  tags: string[];
}

interface Props {
  recipe: AIRecipe;
  onBack: () => void;
}

export function AIRecipeDetail({ recipe, onBack }: Props) {
  const [servings, setServings] = useState(recipe.servings);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [cookingMode, setCookingMode] = useState(false);
  const { addShoppingItems } = useNutrition();

  const ratio = servings / recipe.servings;

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const formatQuantity = (q: number) => {
    const scaled = q * ratio;
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1);
  };

  const difficultyColor = recipe.difficulty === "Facile"
    ? "text-emerald bg-emerald/10"
    : recipe.difficulty === "Moyen"
    ? "text-amber-500 bg-amber-500/10"
    : "text-red-500 bg-red-500/10";

  const handleAddToCart = () => {
    const items = recipe.ingredients.map((ing) => ({
      name: ing.name,
      quantity: `${formatQuantity(ing.quantity)} ${ing.unit}`,
    }));
    addShoppingItems(items);
    toast.success(`${recipe.ingredients.length} ingrédients ajoutés à la liste de courses !`);
  };

  const handlePrint = () => window.print();

  const handleCookingMode = () => {
    setCookingMode(true);
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const exitCookingMode = () => {
    setCookingMode(false);
    document.exitFullscreen?.().catch(() => {});
  };

  if (cookingMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-auto p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-display font-bold">{recipe.image_emoji} {recipe.name}</h1>
            <Button variant="outline" onClick={exitCookingMode}>Quitter</Button>
          </div>
          <div className="space-y-6">
            {recipe.steps.map((step, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-secondary/50">
                <span className="shrink-0 w-10 h-10 rounded-full gradient-cobalt text-primary-foreground text-lg flex items-center justify-center font-bold">{i + 1}</span>
                <p className="text-lg leading-relaxed pt-1.5">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl print:max-w-none">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 print:hidden">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{recipe.image_emoji}</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">{recipe.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3">
          <span className="text-xs px-3 py-1.5 rounded-full bg-secondary font-medium">⏱️ Prépa {recipe.prepTime}</span>
          <span className="text-xs px-3 py-1.5 rounded-full bg-secondary font-medium">🔥 Cuisson {recipe.cookTime}</span>
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${difficultyColor}`}>{recipe.difficulty}</span>
          {recipe.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{tag}</span>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ingredients */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card-solid rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg">🥘 Ingrédients</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setServings(Math.max(1, servings - 1))} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-medium w-20 text-center">{servings} pers.</span>
              <button onClick={() => setServings(Math.min(12, servings + 1))} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          <ul className="space-y-1">
            {recipe.ingredients.map((ing, i) => {
              const checked = checkedIngredients.has(i);
              return (
                <li key={i} className={`flex items-center gap-3 py-2.5 px-2 rounded-lg transition-colors ${checked ? "opacity-50" : "hover:bg-secondary/50"}`}>
                  <Checkbox checked={checked} onCheckedChange={() => toggleIngredient(i)} className="rounded-md" />
                  <span className={`flex-1 text-sm ${checked ? "line-through text-muted-foreground" : ""}`}>{ing.name}</span>
                  <span className={`text-xs font-medium tabular-nums ${checked ? "line-through text-muted-foreground" : "text-muted-foreground"}`}>
                    {formatQuantity(ing.quantity)} {ing.unit}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="w-3 h-3" />
            {checkedIngredients.size}/{recipe.ingredients.length} cochés
          </div>
        </motion.div>

        {/* Steps */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass-card-solid rounded-2xl p-5">
          <h2 className="font-display font-semibold text-lg mb-4">👨‍🍳 Préparation</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full gradient-cobalt text-primary-foreground text-xs flex items-center justify-center font-bold">{i + 1}</span>
                <p className="text-sm leading-relaxed pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </motion.div>
      </div>

      {/* Nutrition */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card-solid rounded-2xl p-6">
        <h2 className="font-display font-semibold text-lg mb-1 text-center">📊 Valeurs Nutritionnelles</h2>
        <p className="text-xs text-muted-foreground text-center mb-4">Par personne · {servings} portion{servings > 1 ? "s" : ""}</p>
        <div className="flex flex-wrap justify-center gap-6">
          <NutritionCircle label="Calories" value={Math.round(recipe.nutrition.calories)} max={2000} unit="kcal" color="hsl(25, 95%, 53%)" />
          <NutritionCircle label="Protéines" value={Math.round(recipe.nutrition.protein)} max={60} unit="g" color="hsl(220, 70%, 50%)" />
          <NutritionCircle label="Glucides" value={Math.round(recipe.nutrition.carbs)} max={100} unit="g" color="hsl(155, 60%, 45%)" />
          <NutritionCircle label="Lipides" value={Math.round(recipe.nutrition.fat)} max={50} unit="g" color="hsl(280, 60%, 55%)" />
          <NutritionCircle label="Fibres" value={Math.round(recipe.nutrition.fiber)} max={30} unit="g" color="hsl(35, 90%, 50%)" />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Total pour {servings} : {Math.round(recipe.nutrition.calories * servings)} kcal
        </p>
      </motion.div>

      {/* Action buttons */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-3 print:hidden">
        <Button onClick={handleAddToCart} className="flex-1 min-w-[200px] gradient-cobalt text-primary-foreground rounded-2xl py-3 h-auto">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Ajouter à ma liste de courses
        </Button>
        <Button variant="outline" onClick={handlePrint} className="rounded-2xl py-3 h-auto">
          <Printer className="w-4 h-4 mr-2" />
          Imprimer
        </Button>
        <Button variant="outline" onClick={handleCookingMode} className="rounded-2xl py-3 h-auto">
          <Maximize className="w-4 h-4 mr-2" />
          Mode Cuisine
        </Button>
      </motion.div>
    </div>
  );
}
