import { useState } from "react";
import { recipes, Recipe } from "@/data/recipes";
import { motion } from "framer-motion";
import { CalendarDays, Plus, X, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const MEALS = ["Petit-déj", "Déjeuner", "Dîner"] as const;

type MealType = typeof MEALS[number];
type PlanningData = Record<string, Record<MealType, Recipe | null>>;

function initPlanning(): PlanningData {
  const saved = localStorage.getItem("nutridash-planning");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const result: PlanningData = {};
      for (const day of DAYS) {
        result[day] = {} as Record<MealType, Recipe | null>;
        for (const meal of MEALS) {
          const id = parsed?.[day]?.[meal];
          result[day][meal] = id ? recipes.find((r) => r.id === id) || null : null;
        }
      }
      return result;
    } catch { /* ignore */ }
  }
  const plan: PlanningData = {};
  for (const day of DAYS) {
    plan[day] = {} as Record<MealType, Recipe | null>;
    for (const meal of MEALS) plan[day][meal] = null;
  }
  return plan;
}

function savePlanning(plan: PlanningData) {
  const toSave: Record<string, Record<string, string | null>> = {};
  for (const day of DAYS) {
    toSave[day] = {};
    for (const meal of MEALS) {
      toSave[day][meal] = plan[day][meal]?.id || null;
    }
  }
  localStorage.setItem("nutridash-planning", JSON.stringify(toSave));
}

function RecipePicker({ onSelect }: { onSelect: (r: Recipe) => void }) {
  const [q, setQ] = useState("");
  const filtered = q.trim()
    ? recipes.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()))
    : recipes;

  return (
    <div className="w-64 space-y-2">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher..."
        className="text-xs h-8 rounded-lg bg-secondary border-0"
      />
      <div className="max-h-48 overflow-y-auto space-y-1">
        {filtered.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-secondary transition-colors flex items-center gap-2"
          >
            <span>{r.image}</span>
            <span className="truncate">{r.name}</span>
            <span className="ml-auto text-muted-foreground">{r.calories} kcal</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">Aucune recette</p>
        )}
      </div>
    </div>
  );
}

export default function Planning() {
  const [plan, setPlan] = useState<PlanningData>(initPlanning);

  const setMeal = (day: string, meal: MealType, recipe: Recipe | null) => {
    setPlan((prev) => {
      const next = { ...prev, [day]: { ...prev[day], [meal]: recipe } };
      savePlanning(next);
      return next;
    });
  };

  const totalCalories = (day: string) =>
    MEALS.reduce((sum, meal) => sum + (plan[day][meal]?.calories || 0), 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-primary" /> Mon Planning
        </h1>
        <p className="text-muted-foreground text-sm">Planifiez vos repas pour la semaine.</p>
      </motion.div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header */}
          <div className="grid grid-cols-[100px_1fr_1fr_1fr_80px] gap-2 mb-2">
            <div />
            {MEALS.map((meal) => (
              <div key={meal} className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-wide">
                {meal}
              </div>
            ))}
            <div className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-wide">kcal</div>
          </div>

          {/* Days */}
          {DAYS.map((day, i) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-[100px_1fr_1fr_1fr_80px] gap-2 mb-2"
            >
              <div className="flex items-center font-display font-semibold text-sm">{day}</div>
              {MEALS.map((meal) => {
                const recipe = plan[day][meal];
                return (
                  <div key={meal} className="glass-card-solid rounded-xl p-2 min-h-[60px] flex items-center">
                    {recipe ? (
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-lg">{recipe.image}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{recipe.name}</p>
                          <p className="text-[10px] text-muted-foreground">{recipe.calories} kcal</p>
                        </div>
                        <button
                          onClick={() => setMeal(day, meal, null)}
                          className="shrink-0 w-5 h-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="w-full h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-2" align="start">
                          <RecipePicker onSelect={(r) => setMeal(day, meal, r)} />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                );
              })}
              <div className="flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{totalCalories(day)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
