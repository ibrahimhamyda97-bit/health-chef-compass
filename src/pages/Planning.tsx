import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { recipes, Recipe } from "@/data/recipes";
import { motion } from "framer-motion";
import { CalendarDays, Plus, X, Pencil, Search, Sparkles, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const MEALS = ["Petit-déj", "Déjeuner", "Dîner"] as const;

type MealType = typeof MEALS[number];

interface ManualDish {
  type: "manual";
  name: string;
  calories: number;
}

type MealEntry = Recipe | ManualDish | null;

function isManual(entry: MealEntry): entry is ManualDish {
  return entry !== null && "type" in entry && entry.type === "manual";
}

function getCalories(entry: MealEntry): number {
  if (!entry) return 0;
  return entry.calories || 0;
}

function getName(entry: MealEntry): string {
  if (!entry) return "";
  return entry.name;
}

type PlanningData = Record<string, Record<MealType, MealEntry>>;

function initPlanning(): PlanningData {
  const saved = localStorage.getItem("nutridash-planning");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const result: PlanningData = {};
      for (const day of DAYS) {
        result[day] = {} as Record<MealType, MealEntry>;
        for (const meal of MEALS) {
          const val = parsed?.[day]?.[meal];
          if (!val) {
            result[day][meal] = null;
          } else if (typeof val === "object" && val.type === "manual") {
            result[day][meal] = val as ManualDish;
          } else {
            const id = typeof val === "string" ? val : val?.id;
            result[day][meal] = id ? recipes.find((r) => r.id === id) || null : null;
          }
        }
      }
      return result;
    } catch { /* ignore */ }
  }
  const plan: PlanningData = {};
  for (const day of DAYS) {
    plan[day] = {} as Record<MealType, MealEntry>;
    for (const meal of MEALS) plan[day][meal] = null;
  }
  return plan;
}

function savePlanning(plan: PlanningData) {
  const toSave: Record<string, Record<string, any>> = {};
  for (const day of DAYS) {
    toSave[day] = {};
    for (const meal of MEALS) {
      const entry = plan[day][meal];
      if (!entry) {
        toSave[day][meal] = null;
      } else if (isManual(entry)) {
        toSave[day][meal] = { type: "manual", name: entry.name, calories: entry.calories };
      } else {
        toSave[day][meal] = (entry as Recipe).id;
      }
    }
  }
  localStorage.setItem("nutridash-planning", JSON.stringify(toSave));
}

function RecipePicker({ onSelect, onManual }: { onSelect: (r: Recipe) => void; onManual: () => void }) {
  const [mode, setMode] = useState<"menu" | "search">("menu");
  const [q, setQ] = useState("");

  if (mode === "menu") {
    return (
      <div className="w-56 space-y-1.5">
        <button
          onClick={() => setMode("search")}
          className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-secondary transition-colors flex items-center gap-2"
        >
          <Search className="w-3.5 h-3.5 text-primary" />
          Rechercher une recette HaMenu
        </button>
        <button
          onClick={onManual}
          className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-secondary transition-colors flex items-center gap-2"
        >
          <Pencil className="w-3.5 h-3.5 text-primary" />
          Écrire mon propre plat
        </button>
      </div>
    );
  }

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
        autoFocus
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

function ManualDishForm({ onSubmit }: { onSubmit: (dish: ManualDish) => void }) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ type: "manual", name: name.trim(), calories: Number(calories) || 0 });
  };

  return (
    <div className="w-56 space-y-2">
      <p className="text-xs font-semibold">Mon propre plat</p>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom du plat"
        className="text-xs h-8 rounded-lg bg-secondary border-0"
        autoFocus
      />
      <Input
        value={calories}
        onChange={(e) => setCalories(e.target.value.replace(/\D/g, ""))}
        placeholder="Calories (optionnel)"
        className="text-xs h-8 rounded-lg bg-secondary border-0"
        type="text"
        inputMode="numeric"
      />
      <Button size="sm" className="w-full h-8 text-xs" onClick={handleSubmit} disabled={!name.trim()}>
        <Check className="w-3.5 h-3.5 mr-1" /> Valider
      </Button>
    </div>
  );
}

function EditManualDishForm({ dish, onSubmit, onDelete }: { dish: ManualDish; onSubmit: (d: ManualDish) => void; onDelete: () => void }) {
  const [name, setName] = useState(dish.name);
  const [calories, setCalories] = useState(String(dish.calories || ""));

  return (
    <div className="w-56 space-y-2">
      <p className="text-xs font-semibold">Modifier le plat</p>
      <Input value={name} onChange={(e) => setName(e.target.value)} className="text-xs h-8 rounded-lg bg-secondary border-0" autoFocus />
      <Input value={calories} onChange={(e) => setCalories(e.target.value.replace(/\D/g, ""))} placeholder="Calories" className="text-xs h-8 rounded-lg bg-secondary border-0" type="text" inputMode="numeric" />
      <div className="flex gap-2">
        <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => { if (name.trim()) onSubmit({ type: "manual", name: name.trim(), calories: Number(calories) || 0 }); }} disabled={!name.trim()}>
          <Check className="w-3.5 h-3.5 mr-1" /> OK
        </Button>
        <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={onDelete}>
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export default function Planning() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanningData>(initPlanning);

  const setMeal = (day: string, meal: MealType, entry: MealEntry) => {
    setPlan((prev) => {
      const next = { ...prev, [day]: { ...prev[day], [meal]: entry } };
      savePlanning(next);
      return next;
    });
  };

  const totalCalories = (day: string) =>
    MEALS.reduce((sum, meal) => sum + getCalories(plan[day][meal]), 0);

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
                const entry = plan[day][meal];
                const manual = isManual(entry);
                return (
                  <div key={meal} className="glass-card-solid rounded-xl p-2 min-h-[60px] flex items-center">
                    {entry ? (
                      manual ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="flex items-center gap-2 w-full text-left">
                              <Pencil className="w-3.5 h-3.5 text-primary shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{entry.name}</p>
                                {entry.calories > 0 && <p className="text-[10px] text-muted-foreground">{entry.calories} kcal</p>}
                              </div>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="p-2" align="start">
                            <EditManualDishForm
                              dish={entry}
                              onSubmit={(d) => setMeal(day, meal, d)}
                              onDelete={() => setMeal(day, meal, null)}
                            />
                            <button
                              onClick={() => navigate(`/recettes?q=${encodeURIComponent(entry.name)}`)}
                              className="mt-2 w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Générer la recette pour ce plat ?
                            </button>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <div className="flex items-center gap-2 w-full">
                          <span className="text-lg">{(entry as Recipe).image}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{entry.name}</p>
                            <p className="text-[10px] text-muted-foreground">{entry.calories} kcal</p>
                          </div>
                          <button
                            onClick={() => setMeal(day, meal, null)}
                            className="shrink-0 w-5 h-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )
                    ) : (
                      <MealSlotPopover day={day} meal={meal} setMeal={setMeal} />
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

function MealSlotPopover({ day, meal, setMeal }: { day: string; meal: MealType; setMeal: (d: string, m: MealType, e: MealEntry) => void }) {
  const [showManual, setShowManual] = useState(false);

  return (
    <Popover onOpenChange={() => setShowManual(false)}>
      <PopoverTrigger asChild>
        <button className="w-full h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-2" align="start">
        {showManual ? (
          <ManualDishForm onSubmit={(d) => setMeal(day, meal, d)} />
        ) : (
          <RecipePicker
            onSelect={(r) => setMeal(day, meal, r)}
            onManual={() => setShowManual(true)}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
