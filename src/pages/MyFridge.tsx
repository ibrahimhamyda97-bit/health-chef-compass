import { useState, KeyboardEvent } from "react";
import { useNutrition } from "@/context/NutritionContext";
import { recipes } from "@/data/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import { X, Plus, Lightbulb, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

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
  const [searchTriggered, setSearchTriggered] = useState(false);

  const formatIngredientLabel = (value: string) =>
    value
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const hasFridgeItem = (...keywords: string[]) =>
    fridgeItems.some((item) =>
      keywords.some((keyword) => item.includes(keyword) || keyword.includes(item))
    );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      addFridgeItem(input);
      setInput("");
      setSearchTriggered(false);
    }
  };

  const matchedRecipes = fridgeItems.length > 0
    ? recipes.filter((recipe) => {
        const fridgeLower = fridgeItems.map((item) => item.toLowerCase().trim());

        return recipe.ingredients.every((ingredient) => {
          const ingredientName = ingredient.name.toLowerCase();
          return fridgeLower.some(
            (item) => ingredientName.includes(item) || item.includes(ingredientName)
          );
        });
      })
    : [];

  const suggestions = fridgeItems.length > 0
    ? Array.from(
        new Set(
          fridgeItems.flatMap((item) => {
            const key = Object.keys(ingredientSuggestions).find(
              (suggestionKey) =>
                item.toLowerCase().includes(suggestionKey) ||
                suggestionKey.includes(item.toLowerCase())
            );
            return key ? ingredientSuggestions[key] : [];
          })
        )
      )
        .filter(
          (suggestion) =>
            !fridgeItems.some(
              (fridgeItem) => fridgeItem.toLowerCase() === suggestion.toLowerCase()
            )
        )
        .slice(0, 6)
    : [];

  const fallbackRecipe = fridgeItems.length > 0
    ? (() => {
        const formattedItems = fridgeItems.map(formatIngredientLabel);

        if (hasFridgeItem("oeuf", "œuf", "oeufs", "œufs")) {
          return {
            title: "Omelette du frigo",
            emoji: "🍳",
            description: `Une idée express préparée uniquement avec : ${formattedItems.join(", ")}.`,
            steps: [
              "Coupez les autres ingrédients ajoutés en petits morceaux si nécessaire.",
              "Faites cuire ensemble les ingrédients qui doivent l'être, puis ajoutez-les aux œufs.",
              "Laissez prendre doucement et servez dès que l'omelette est bien cuite.",
            ],
          };
        }

        if (hasFridgeItem("pâtes", "pates")) {
          return {
            title: "Pâtes du frigo",
            emoji: "🍝",
            description: `Un plat simple composé seulement avec : ${formattedItems.join(", ")}.`,
            steps: [
              "Faites cuire les pâtes, puis préparez le reste des ingrédients ajoutés.",
              "Cuisez ou réchauffez ensemble les ingrédients compatibles.",
              "Mélangez le tout avec les pâtes et servez aussitôt.",
            ],
          };
        }

        if (hasFridgeItem("riz")) {
          return {
            title: "Poêlée de riz du frigo",
            emoji: "🍚",
            description: `Une poêlée improvisée avec uniquement : ${formattedItems.join(", ")}.`,
            steps: [
              "Faites cuire le riz si besoin et préparez les autres ingrédients ajoutés.",
              "Faites revenir ensemble les ingrédients qui gagnent à être chauds.",
              "Ajoutez le riz, mélangez bien puis servez votre poêlée.",
            ],
          };
        }

        if (hasFridgeItem("salade", "laitue", "tomate", "avocat", "concombre")) {
          return {
            title: "Salade du frigo",
            emoji: "🥗",
            description: `Une assiette fraîche réalisée uniquement avec : ${formattedItems.join(", ")}.`,
            steps: [
              "Lavez et découpez tous les ingrédients ajoutés si nécessaire.",
              "Assemblez-les dans un bol en répartissant bien les textures.",
              "Servez immédiatement pour garder un maximum de fraîcheur.",
            ],
          };
        }

        if (hasFridgeItem("pain")) {
          return {
            title: "Tartines du frigo",
            emoji: "🥪",
            description: `Des tartines composées uniquement avec : ${formattedItems.join(", ")}.`,
            steps: [
              "Préparez les ingrédients ajoutés pour pouvoir garnir le pain facilement.",
              "Déposez-les sur le pain dans l'ordre qui vous semble le plus gourmand.",
              "Servez tel quel ou passez rapidement au chaud si certains ingrédients s'y prêtent.",
            ],
          };
        }

        return {
          title: "Assiette du frigo",
          emoji: "🍽️",
          description: `Une idée de plat à faire uniquement avec : ${formattedItems.join(", ")}.`,
          steps: [
            "Préparez tous les ingrédients ajoutés en les découpant si besoin.",
            "Faites cuire ensemble ceux qui doivent l'être, puis ajoutez les autres en fin de préparation.",
            "Dressez l'ensemble dans une assiette et servez immédiatement.",
          ],
        };
      })()
    : null;

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
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tapez un ingrédient et appuyez sur Entrée..."
            className="rounded-xl bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <button
            onClick={() => {
              if (input.trim()) {
                addFridgeItem(input);
                setInput("");
                setSearchTriggered(false);
              }
            }}
            className="shrink-0 w-10 h-10 rounded-xl gradient-cobalt flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {fridgeItems.length > 0 && (
          <button
            onClick={() => setSearchTriggered(true)}
            className="w-full py-3 rounded-xl gradient-cobalt text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-95"
          >
            <Search className="w-4 h-4" />
            Rechercher des plats
          </button>
        )}

        {fridgeItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {fridgeItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 bg-secondary rounded-full px-3 py-1.5 text-sm font-medium"
              >
                {item}
                <button
                  onClick={() => {
                    removeFridgeItem(item);
                    setSearchTriggered(false);
                  }}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-primary" />
              Suggestions pour améliorer vos plats :
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    addFridgeItem(suggestion);
                    setSearchTriggered(false);
                  }}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                  <Plus className="w-3 h-3" /> {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {searchTriggered && matchedRecipes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-display font-semibold mb-3">
            🎯 {matchedRecipes.length} plat{matchedRecipes.length > 1 ? "s" : ""} possible{matchedRecipes.length > 1 ? "s" : ""} uniquement avec vos ingrédients
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} highlight />
            ))}
          </div>
        </motion.div>
      )}

      {searchTriggered && fridgeItems.length > 0 && matchedRecipes.length === 0 && fallbackRecipe && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card-solid rounded-2xl p-5 space-y-4"
        >
          <div>
            <p className="text-xs font-medium text-primary mb-2">Suggestion automatique</p>
            <div className="flex items-start gap-3">
              <span className="text-4xl">{fallbackRecipe.emoji}</span>
              <div>
                <h2 className="text-lg font-display font-semibold">{fallbackRecipe.title}</h2>
                <p className="text-sm text-muted-foreground">{fallbackRecipe.description}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Ingrédients utilisés</h3>
            <div className="flex flex-wrap gap-2">
              {fridgeItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full bg-secondary px-3 py-1.5 text-sm font-medium"
                >
                  {formatIngredientLabel(item)}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Préparation</h3>
            <ol className="space-y-2">
              {fallbackRecipe.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-cobalt text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
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
