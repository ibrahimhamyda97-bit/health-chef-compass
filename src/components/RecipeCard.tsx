import { Recipe } from "@/data/recipes";
import { useNutrition } from "@/context/NutritionContext";
import { Heart, Clock, Flame, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecipeCardProps {
  recipe: Recipe;
  highlight?: boolean;
}

export function RecipeCard({ recipe, highlight }: RecipeCardProps) {
  const { mode, favorites, toggleFavorite, isInCart, toggleCart } = useNutrition();
  const navigate = useNavigate();
  const isFav = favorites.includes(recipe.id);
  const inCart = isInCart(recipe.id);
  const isHealthy = recipe.healthy && mode === "perte";

  return (
    <div
      onClick={() => navigate(`/recettes?id=${recipe.id}`)}
      className={`glass-card-solid rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg group ${
        isHealthy ? "ring-2 ring-emerald/30" : ""
      } ${highlight ? "ring-2 ring-primary/30" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{recipe.image}</span>
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); toggleCart(recipe.id); }}
            className="p-1 rounded-full hover:bg-secondary transition-colors"
            title={inCart ? "Retirer du panier" : "Ajouter au panier"}
          >
            <ShoppingCart className={`w-4 h-4 ${inCart ? "fill-primary text-primary" : "text-muted-foreground"}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
            className="p-1 rounded-full hover:bg-secondary transition-colors"
          >
            <Heart className={`w-4 h-4 ${isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
          </button>
        </div>
      </div>
      <h3 className="font-display font-semibold text-sm mb-1">{recipe.name}</h3>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{recipe.prepTime}</span>
        <span className={`flex items-center gap-1 ${isHealthy ? "text-emerald font-medium" : ""}`}>
          <Flame className="w-3 h-3" />{recipe.calories} kcal
        </span>
      </div>
      {isHealthy && (
        <span className="inline-block mt-2 text-[10px] font-medium bg-emerald-soft text-emerald px-2 py-0.5 rounded-full">
          ✓ Recommandé
        </span>
      )}
      {inCart && (
        <span className="inline-block mt-2 ml-1 text-[10px] font-medium bg-primary/10 text-cobalt px-2 py-0.5 rounded-full">
          🛒 Panier
        </span>
      )}
    </div>
  );
}
