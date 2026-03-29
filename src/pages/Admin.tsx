import { useState } from "react";
import { recipes as defaultRecipes, Recipe } from "@/data/recipes";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ShieldCheck, Plus, X, Trash2, Edit, Save } from "lucide-react";
import { toast } from "sonner";

function loadRecipes(): Recipe[] {
  const saved = localStorage.getItem("nutridash-custom-recipes");
  if (saved) {
    try {
      return [...defaultRecipes, ...JSON.parse(saved)];
    } catch { /* ignore */ }
  }
  return [...defaultRecipes];
}

function saveCustomRecipes(all: Recipe[]) {
  const custom = all.filter((r) => parseInt(r.id) > 1000);
  localStorage.setItem("nutridash-custom-recipes", JSON.stringify(custom));
}

export default function Admin() {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>(loadRecipes);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [image, setImage] = useState("🍽️");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [servings, setServings] = useState("1");
  const [ingredients, setIngredients] = useState<{ name: string; quantity: string }[]>([{ name: "", quantity: "" }]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [tags, setTags] = useState("");

  const resetForm = () => {
    setName(""); setImage("🍽️"); setCalories(""); setProtein(""); setCarbs("");
    setFat(""); setPrepTime(""); setServings("1"); setTags("");
    setIngredients([{ name: "", quantity: "" }]); setSteps([""]); setEditId(null);
  };

  const fillForm = (r: Recipe) => {
    setName(r.name); setImage(r.image); setCalories(String(r.calories));
    setProtein(String(r.protein)); setCarbs(String(r.carbs)); setFat(String(r.fat));
    setPrepTime(r.prepTime); setServings(String(r.servings)); setTags(r.tags.join(", "));
    setIngredients(r.ingredients); setSteps(r.steps); setEditId(r.id); setShowForm(true);
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error("Le nom est requis"); return; }

    const recipe: Recipe = {
      id: editId || String(Date.now()),
      name: name.trim(),
      image,
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
      servings: parseInt(servings) || 1,
      prepTime: prepTime || "15 min",
      tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      ingredients: ingredients.filter((i) => i.name.trim()),
      steps: steps.filter((s) => s.trim()),
      healthy: (parseInt(calories) || 0) < 500,
    };

    let updated: Recipe[];
    if (editId) {
      updated = allRecipes.map((r) => (r.id === editId ? recipe : r));
      toast.success("Recette mise à jour !");
    } else {
      updated = [...allRecipes, recipe];
      toast.success("Recette ajoutée !");
    }

    setAllRecipes(updated);
    saveCustomRecipes(updated);
    resetForm();
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = allRecipes.filter((r) => r.id !== id);
    setAllRecipes(updated);
    saveCustomRecipes(updated);
    toast.success("Recette supprimée");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" /> Administration
        </h1>
        <p className="text-muted-foreground text-sm">Gérez les recettes et les ingrédients.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total recettes", value: allRecipes.length },
          { label: "Recettes saines", value: allRecipes.filter((r) => r.healthy).length },
          { label: "Personnalisées", value: allRecipes.filter((r) => parseInt(r.id) > 1000).length },
          { label: "Ingrédients uniques", value: new Set(allRecipes.flatMap((r) => r.ingredients.map((i) => i.name))).size },
        ].map((s) => (
          <div key={s.label} className="glass-card-solid rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={() => { resetForm(); setShowForm(!showForm); }}
        className="px-4 py-2 rounded-xl gradient-cobalt text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> {showForm ? "Annuler" : "Ajouter une recette"}
      </button>

      {/* Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-solid rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold">{editId ? "Modifier la recette" : "Nouvelle recette"}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nom *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de la recette" className="rounded-lg bg-secondary border-0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Emoji</label>
              <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="🍽️" className="rounded-lg bg-secondary border-0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Calories</label>
              <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="0" className="rounded-lg bg-secondary border-0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Protéines (g)</label>
              <Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" className="rounded-lg bg-secondary border-0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Glucides (g)</label>
              <Input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="0" className="rounded-lg bg-secondary border-0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Lipides (g)</label>
              <Input type="number" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="0" className="rounded-lg bg-secondary border-0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Temps de préparation</label>
              <Input value={prepTime} onChange={(e) => setPrepTime(e.target.value)} placeholder="20 min" className="rounded-lg bg-secondary border-0" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Portions</label>
              <Input type="number" value={servings} onChange={(e) => setServings(e.target.value)} placeholder="1" className="rounded-lg bg-secondary border-0" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Tags (séparés par des virgules)</label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="poulet, riz, légumes" className="rounded-lg bg-secondary border-0" />
          </div>

          {/* Ingredients */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Ingrédients</label>
            <div className="space-y-2 mt-1">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={ing.name}
                    onChange={(e) => { const next = [...ingredients]; next[i] = { ...next[i], name: e.target.value }; setIngredients(next); }}
                    placeholder="Ingrédient"
                    className="rounded-lg bg-secondary border-0 flex-1"
                  />
                  <Input
                    value={ing.quantity}
                    onChange={(e) => { const next = [...ingredients]; next[i] = { ...next[i], quantity: e.target.value }; setIngredients(next); }}
                    placeholder="Quantité"
                    className="rounded-lg bg-secondary border-0 w-28"
                  />
                  <button onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={() => setIngredients([...ingredients, { name: "", quantity: "" }])} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Ajouter un ingrédient
              </button>
            </div>
          </div>

          {/* Steps */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Étapes</label>
            <div className="space-y-2 mt-1">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="shrink-0 w-5 h-5 rounded-full gradient-cobalt text-primary-foreground text-[10px] flex items-center justify-center font-bold mt-2">{i + 1}</span>
                  <Input
                    value={step}
                    onChange={(e) => { const next = [...steps]; next[i] = e.target.value; setSteps(next); }}
                    placeholder={`Étape ${i + 1}`}
                    className="rounded-lg bg-secondary border-0"
                  />
                  <button onClick={() => setSteps(steps.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80 mt-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={() => setSteps([...steps, ""])} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Ajouter une étape
              </button>
            </div>
          </div>

          <button onClick={handleSave} className="px-5 py-2 rounded-xl gradient-cobalt text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
            <Save className="w-4 h-4" /> {editId ? "Mettre à jour" : "Enregistrer"}
          </button>
        </motion.div>
      )}

      {/* Recipe list */}
      <div className="space-y-2">
        <h2 className="font-display font-semibold">Toutes les recettes ({allRecipes.length})</h2>
        <div className="space-y-2">
          {allRecipes.map((r) => (
            <div key={r.id} className="glass-card-solid rounded-xl p-3 flex items-center gap-3">
              <span className="text-2xl">{r.image}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.calories} kcal · {r.ingredients.length} ingrédients · {r.prepTime}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => fillForm(r)} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
