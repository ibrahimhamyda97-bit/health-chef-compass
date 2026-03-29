import { useNutrition } from "@/context/NutritionContext";
import { recipes } from "@/data/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import { motion } from "framer-motion";

export default function Favorites() {
  const { favorites } = useNutrition();
  const favRecipes = recipes.filter((r) => favorites.includes(r.id));

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Favoris ❤️</h1>
        <p className="text-muted-foreground text-sm">Retrouvez vos recettes préférées ici.</p>
      </motion.div>

      {favRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favRecipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-5xl mb-3">💔</p>
          <p className="font-medium">Aucun favori pour le moment</p>
          <p className="text-sm mt-1">Cliquez sur le ❤️ d'une recette pour l'ajouter ici.</p>
        </div>
      )}
    </div>
  );
}
