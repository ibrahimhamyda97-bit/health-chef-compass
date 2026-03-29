import { useNutrition } from "@/context/NutritionContext";
import { Switch } from "@/components/ui/switch";
import { NutritionCircle } from "@/components/NutritionCircle";
import { Target, TrendingDown, TrendingUp, Droplets, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

export default function HealthGoals() {
  const { mode, setMode } = useNutrition();
  const isPerte = mode === "perte";

  const goals = isPerte
    ? [
        { label: "Calories / jour", value: 1800, max: 2500, unit: "kcal", color: "hsl(25, 95%, 53%)", icon: TrendingDown },
        { label: "Protéines", value: 100, max: 150, unit: "g", color: "hsl(220, 70%, 50%)", icon: Dumbbell },
        { label: "Eau", value: 2.1, max: 3, unit: "L", color: "hsl(200, 80%, 55%)", icon: Droplets },
      ]
    : [
        { label: "Calories / jour", value: 2800, max: 3500, unit: "kcal", color: "hsl(25, 95%, 53%)", icon: TrendingUp },
        { label: "Protéines", value: 160, max: 200, unit: "g", color: "hsl(220, 70%, 50%)", icon: Dumbbell },
        { label: "Eau", value: 3, max: 4, unit: "L", color: "hsl(200, 80%, 55%)", icon: Droplets },
      ];

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Objectif Santé 🎯</h1>
        <p className="text-muted-foreground text-sm">Définissez votre objectif et suivez vos progrès.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-solid rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPerte ? "gradient-emerald" : "gradient-cobalt"}`}>
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-semibold">Mode Régime</h2>
              <p className="text-xs text-muted-foreground">{isPerte ? "Déficit calorique actif" : "Surplus calorique actif"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${isPerte ? "text-emerald" : "text-muted-foreground"}`}>Perte</span>
            <Switch checked={mode === "masse"} onCheckedChange={(c) => setMode(c ? "masse" : "perte")} />
            <span className={`text-sm font-medium ${!isPerte ? "text-cobalt" : "text-muted-foreground"}`}>Masse</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {goals.map((g) => (
            <div key={g.label} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-secondary/50">
              <NutritionCircle label={g.label} value={g.value} max={g.max} unit={g.unit} color={g.color} />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <g.icon className="w-3 h-3" />
                <span>Objectif : {g.max} {g.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-solid rounded-2xl p-6">
        <h2 className="font-display font-semibold mb-4">Conseils du jour</h2>
        <div className="space-y-3">
          {(isPerte
            ? [
                "🥦 Privilégiez les légumes verts à chaque repas",
                "💧 Buvez au moins 2L d'eau par jour",
                "🚶 Visez 10 000 pas quotidiens",
                "🍳 Commencez la journée avec des protéines",
              ]
            : [
                "🥩 Augmentez votre apport en protéines à chaque repas",
                "🍚 N'hésitez pas sur les glucides complexes",
                "💪 Entraînez-vous au moins 4 fois par semaine",
                "😴 Dormez 8h minimum pour la récupération",
              ]
          ).map((tip, i) => (
            <p key={i} className="text-sm py-2 border-b border-border last:border-0">{tip}</p>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
