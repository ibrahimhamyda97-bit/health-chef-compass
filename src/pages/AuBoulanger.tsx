import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CakeSlice, Clock, ChefHat, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNutrition } from "@/context/NutritionContext";
import { supabase } from "@/integrations/supabase/client";
import { AIRecipeDetail, AIRecipe } from "@/components/AIRecipeDetail";
import hamiaAvatar from "@/assets/hamia-avatar.png";
import { toast } from "sonner";

interface PastryRecipe {
  id: string;
  name: string;
  image: string;
  difficulty: string;
  duration: string;
  ingredients: { name: string; quantity: string }[];
  steps: string[];
}

const pastryRecipes: PastryRecipe[] = [
  {
    id: "p1",
    name: "Fondant au Chocolat",
    image: "🍫",
    difficulty: "débutant",
    duration: "30 min",
    ingredients: [
      { name: "Chocolat noir", quantity: "200g" },
      { name: "Beurre", quantity: "100g" },
      { name: "Sucre", quantity: "80g" },
      { name: "Œufs", quantity: "3" },
      { name: "Farine", quantity: "50g" },
    ],
    steps: [
      "Préchauffer le four à 180°C.",
      "Faire fondre le chocolat et le beurre au bain-marie.",
      "Fouetter les œufs avec le sucre jusqu'à blanchiment.",
      "Incorporer le mélange chocolat-beurre, puis la farine tamisée.",
      "Verser dans un moule beurré et cuire 12-15 min.",
    ],
  },
  {
    id: "p2",
    name: "Tarte aux Pommes",
    image: "🍎",
    difficulty: "intermédiaire",
    duration: "1h",
    ingredients: [
      { name: "Pâte brisée", quantity: "1 rouleau" },
      { name: "Pommes", quantity: "5" },
      { name: "Sucre", quantity: "60g" },
      { name: "Beurre", quantity: "30g" },
      { name: "Cannelle", quantity: "1 c. à café" },
      { name: "Compote de pommes", quantity: "3 c. à soupe" },
    ],
    steps: [
      "Préchauffer le four à 200°C.",
      "Étaler la pâte dans un moule et piquer le fond avec une fourchette.",
      "Étaler la compote sur le fond de tarte.",
      "Éplucher et couper les pommes en fines lamelles.",
      "Disposer les lamelles en rosace, saupoudrer de sucre et cannelle.",
      "Parsemer de noisettes de beurre et cuire 35-40 min.",
    ],
  },
  {
    id: "p3",
    name: "Crêpes Sucrées",
    image: "🥞",
    difficulty: "débutant",
    duration: "25 min",
    ingredients: [
      { name: "Farine", quantity: "250g" },
      { name: "Œufs", quantity: "3" },
      { name: "Lait", quantity: "50cl" },
      { name: "Sucre", quantity: "30g" },
      { name: "Beurre fondu", quantity: "30g" },
      { name: "Sel", quantity: "1 pincée" },
    ],
    steps: [
      "Mélanger la farine, le sucre et le sel dans un saladier.",
      "Creuser un puits, ajouter les œufs et mélanger.",
      "Verser le lait progressivement en fouettant pour éviter les grumeaux.",
      "Ajouter le beurre fondu et laisser reposer 30 min.",
      "Cuire chaque crêpe dans une poêle beurrée, 1-2 min par face.",
    ],
  },
  {
    id: "p4",
    name: "Mousse au Chocolat",
    image: "🍮",
    difficulty: "débutant",
    duration: "20 min + repos",
    ingredients: [
      { name: "Chocolat noir", quantity: "200g" },
      { name: "Œufs", quantity: "6" },
      { name: "Sucre", quantity: "30g" },
      { name: "Sel", quantity: "1 pincée" },
    ],
    steps: [
      "Faire fondre le chocolat au bain-marie et laisser tiédir.",
      "Séparer les blancs des jaunes d'œufs.",
      "Incorporer les jaunes au chocolat fondu.",
      "Monter les blancs en neige ferme avec le sel et le sucre.",
      "Incorporer délicatement les blancs au chocolat en 3 fois.",
      "Réfrigérer au moins 4h avant de servir.",
    ],
  },
  {
    id: "p5",
    name: "Cake au Citron",
    image: "🍋",
    difficulty: "débutant",
    duration: "50 min",
    ingredients: [
      { name: "Farine", quantity: "200g" },
      { name: "Sucre", quantity: "150g" },
      { name: "Beurre", quantity: "100g" },
      { name: "Œufs", quantity: "3" },
      { name: "Citrons", quantity: "2 (zeste + jus)" },
      { name: "Levure chimique", quantity: "1 sachet" },
    ],
    steps: [
      "Préchauffer le four à 170°C.",
      "Battre le beurre mou avec le sucre jusqu'à crémeux.",
      "Ajouter les œufs un à un, puis le zeste et le jus de citron.",
      "Incorporer la farine et la levure tamisées.",
      "Verser dans un moule à cake beurré et cuire 40 min.",
      "Laisser tiédir, démouler et napper de glaçage citron.",
    ],
  },
  {
    id: "p6",
    name: "Madeleines",
    image: "🧁",
    difficulty: "intermédiaire",
    duration: "35 min + repos",
    ingredients: [
      { name: "Farine", quantity: "150g" },
      { name: "Sucre", quantity: "100g" },
      { name: "Beurre", quantity: "125g" },
      { name: "Œufs", quantity: "3" },
      { name: "Miel", quantity: "1 c. à soupe" },
      { name: "Levure chimique", quantity: "½ sachet" },
    ],
    steps: [
      "Fondre le beurre et laisser refroidir.",
      "Fouetter les œufs avec le sucre et le miel.",
      "Incorporer la farine et la levure, puis le beurre fondu.",
      "Réfrigérer la pâte au moins 1h (idéalement une nuit).",
      "Beurrer les moules, remplir aux ¾ et cuire à 220°C 5 min puis 180°C 7 min.",
    ],
  },
];

const difficultyColors: Record<string, string> = {
  "débutant": "bg-emerald-500/10 text-emerald-600",
  "intermédiaire": "bg-amber-500/10 text-amber-600",
  "avancé": "bg-red-500/10 text-red-600",
};

export default function AuBoulanger() {
  const { fridgeItems, mode } = useNutrition();
  const [selectedRecipe, setSelectedRecipe] = useState<PastryRecipe | null>(null);
  const [aiRecipe, setAiRecipe] = useState<(AIRecipe & { hamia_tip?: string }) | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const generatePastryFromFridge = async () => {
    if (fridgeItems.length === 0) {
      toast.error("Ajoutez d'abord des ingrédients dans Mon Frigo !");
      return;
    }
    setAiLoading(true);
    setAiRecipe(null);
    try {
      const { data, error } = await supabase.functions.invoke("fridge-recipe", {
        body: {
          ingredients: fridgeItems,
          mode,
          pastryMode: true,
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.recipe) throw new Error("Aucune recette générée");
      setAiRecipe(data.recipe);
    } catch (e: any) {
      console.error("HamIA pastry error:", e);
      toast.error(e.message || "Erreur lors de la génération");
    } finally {
      setAiLoading(false);
    }
  };

  // AI recipe view
  if (aiRecipe) {
    return (
      <div className="space-y-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => setAiRecipe(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <div className="flex items-center gap-3 mb-2">
            <img src={hamiaAvatar} alt="HamIA" className="w-10 h-10 rounded-full ring-2 ring-primary/30" />
            <div>
              <p className="text-sm font-semibold text-primary">HamIA – Pâtissière</p>
              <p className="text-xs text-muted-foreground">Voici ma suggestion sucrée !</p>
            </div>
          </div>
          {aiRecipe.hamia_tip && (
            <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-xl p-4 mb-4">
              <ChefHat className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80 italic">💡 {aiRecipe.hamia_tip}</p>
            </div>
          )}
        </motion.div>
        <AIRecipeDetail recipe={aiRecipe} onBack={() => setAiRecipe(null)} />
      </div>
    );
  }

  // Selected local recipe view
  if (selectedRecipe) {
    return (
      <div className="space-y-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => setSelectedRecipe(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">{selectedRecipe.image}</span>
            <div>
              <h1 className="text-2xl font-display font-bold">{selectedRecipe.name}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> {selectedRecipe.duration}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${difficultyColors[selectedRecipe.difficulty] || "bg-muted text-muted-foreground"}`}>
                  {selectedRecipe.difficulty}
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card-solid rounded-2xl p-5">
            <h2 className="font-display font-semibold mb-4">Ingrédients</h2>
            <ul className="space-y-2">
              {selectedRecipe.ingredients.map((ing, i) => (
                <li key={i} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                  <span>{ing.name}</span>
                  <span className="text-muted-foreground font-medium">{ing.quantity}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass-card-solid rounded-2xl p-5">
            <h2 className="font-display font-semibold mb-4">Préparation</h2>
            <ol className="space-y-4">
              {selectedRecipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full gradient-cobalt text-primary-foreground text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  <p className="text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          Au Boulanger 🥐
        </h1>
        <p className="text-muted-foreground text-sm">
          Recettes de pâtisserie et suggestions sucrées par HamIA.
        </p>
      </motion.div>

      <Tabs defaultValue="recettes" className="w-full">
        <TabsList className="w-full grid grid-cols-2 rounded-xl">
          <TabsTrigger value="recettes" className="rounded-lg">🍰 Recettes</TabsTrigger>
          <TabsTrigger value="hamia" className="rounded-lg">✨ HamIA Pâtissière</TabsTrigger>
        </TabsList>

        <TabsContent value="recettes" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastryRecipes.map((recipe, i) => (
              <motion.button
                key={recipe.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setSelectedRecipe(recipe)}
                className="glass-card-solid rounded-2xl p-5 text-left hover:ring-2 hover:ring-primary/30 transition-all active:scale-[0.98]"
              >
                <div className="text-3xl mb-3">{recipe.image}</div>
                <h3 className="font-display font-semibold text-sm mb-1">{recipe.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {recipe.duration}
                </div>
                <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${difficultyColors[recipe.difficulty] || "bg-muted text-muted-foreground"}`}>
                  {recipe.difficulty}
                </span>
              </motion.button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hamia" className="mt-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-solid rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-4">
              <img
                src={hamiaAvatar}
                alt="HamIA Pâtissière"
                className="w-14 h-14 rounded-full ring-2 ring-primary/30 shadow-lg"
              />
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  HamIA Pâtissière
                  <Sparkles className="w-4 h-4 text-primary" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Je crée un gâteau ou dessert avec les ingrédients de votre frigo !
                </p>
              </div>
            </div>

            {fridgeItems.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Ingrédients disponibles : <span className="font-medium text-foreground">{fridgeItems.join(", ")}</span>
                </p>
                <Button
                  onClick={generatePastryFromFridge}
                  disabled={aiLoading}
                  className="w-full gradient-cobalt text-primary-foreground rounded-xl py-3 h-auto font-semibold"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      HamIA pâtisse...
                    </>
                  ) : (
                    <>
                      <CakeSlice className="w-4 h-4 mr-2" />
                      Créer un dessert avec mes ingrédients
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-3xl mb-2">🧊</p>
                <p className="text-sm">Ajoutez des ingrédients dans <strong>Mon Frigo</strong> pour que HamIA vous propose un dessert !</p>
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
