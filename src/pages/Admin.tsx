import { useState, useEffect } from "react";
import { recipes as defaultRecipes, Recipe } from "@/data/recipes";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ShieldCheck, Plus, X, Trash2, Edit, Save, Users, BookOpen, DollarSign, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// ── Recipe helpers ──
function loadRecipes(): Recipe[] {
  const saved = localStorage.getItem("nutridash-custom-recipes");
  if (saved) {
    try { return [...defaultRecipes, ...JSON.parse(saved)]; } catch { /* ignore */ }
  }
  return [...defaultRecipes];
}
function saveCustomRecipes(all: Recipe[]) {
  const custom = all.filter((r) => parseInt(r.id) > 1000);
  localStorage.setItem("nutridash-custom-recipes", JSON.stringify(custom));
}

// ── Types ──
interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface PastryCourse {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  difficulty: string;
  duration: string | null;
  content: string | null;
  steps: string[];
  published: boolean;
  created_at: string;
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

  // Users state
  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Courses state
  const [courses, setCourses] = useState<PastryCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseImage, setCourseImage] = useState("");
  const [courseDifficulty, setCourseDifficulty] = useState("débutant");
  const [courseDuration, setCourseDuration] = useState("");
  const [courseContent, setCourseContent] = useState("");
  const [courseSteps, setCourseSteps] = useState<string[]>([""]);
  const [coursePublished, setCoursePublished] = useState(false);

  // Monetization state
  const [monet, setMonet] = useState({
    subscriptionEnabled: false,
    monthlyPrice: "9.99",
    yearlyPrice: "99.99",
    freeTrial: true,
    trialDays: "7",
    premiumCoursesOnly: false,
    currency: "EUR",
  });

  useEffect(() => {
    fetchUsers();
    fetchCourses();
    fetchMonetization();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setUsers(data as Profile[]);
    setLoadingUsers(false);
  };

  const fetchCourses = async () => {
    setLoadingCourses(true);
    const { data } = await supabase.from("pastry_courses").select("*").order("created_at", { ascending: false });
    if (data) setCourses(data.map((c: any) => ({ ...c, steps: Array.isArray(c.steps) ? c.steps : [] })) as PastryCourse[]);
    setLoadingCourses(false);
  };

  const fetchMonetization = async () => {
    const { data } = await supabase.from("monetization_settings").select("*");
    if (data && data.length > 0) {
      const settings: Record<string, any> = {};
      data.forEach((s: any) => { settings[s.setting_key] = s.setting_value; });
      if (settings.config) setMonet({ ...monet, ...settings.config });
    }
  };

  const saveMonetization = async () => {
    const { error } = await supabase.from("monetization_settings").upsert({
      setting_key: "config",
      setting_value: monet as any,
    }, { onConflict: "setting_key" });
    if (error) toast.error("Erreur de sauvegarde");
    else toast.success("Paramètres de monétisation sauvegardés !");
  };

  // ── Recipe CRUD ──
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
      id: editId || String(Date.now()), name: name.trim(), image,
      calories: parseInt(calories) || 0, protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0, fat: parseInt(fat) || 0,
      servings: parseInt(servings) || 1, prepTime: prepTime || "15 min",
      tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      ingredients: ingredients.filter((i) => i.name.trim()),
      steps: steps.filter((s) => s.trim()), healthy: (parseInt(calories) || 0) < 500,
    };
    let updated: Recipe[];
    if (editId) { updated = allRecipes.map((r) => (r.id === editId ? recipe : r)); toast.success("Recette mise à jour !"); }
    else { updated = [...allRecipes, recipe]; toast.success("Recette ajoutée !"); }
    setAllRecipes(updated); saveCustomRecipes(updated); resetForm(); setShowForm(false);
  };
  const handleDelete = (id: string) => {
    const updated = allRecipes.filter((r) => r.id !== id);
    setAllRecipes(updated); saveCustomRecipes(updated); toast.success("Recette supprimée");
  };

  // ── Course CRUD ──
  const resetCourseForm = () => {
    setCourseTitle(""); setCourseDesc(""); setCourseImage(""); setCourseDifficulty("débutant");
    setCourseDuration(""); setCourseContent(""); setCourseSteps([""]); setCoursePublished(false); setEditCourseId(null);
  };
  const fillCourseForm = (c: PastryCourse) => {
    setCourseTitle(c.title); setCourseDesc(c.description || ""); setCourseImage(c.image_url || "");
    setCourseDifficulty(c.difficulty); setCourseDuration(c.duration || "");
    setCourseContent(c.content || ""); setCourseSteps(c.steps.length > 0 ? c.steps : [""]); setCoursePublished(c.published);
    setEditCourseId(c.id); setShowCourseForm(true);
  };
  const handleSaveCourse = async () => {
    if (!courseTitle.trim()) { toast.error("Le titre est requis"); return; }
    const payload = {
      title: courseTitle.trim(), description: courseDesc || null, image_url: courseImage || null,
      difficulty: courseDifficulty, duration: courseDuration || null, content: courseContent || null,
      steps: courseSteps.filter((s) => s.trim()), published: coursePublished,
    };
    if (editCourseId) {
      const { error } = await supabase.from("pastry_courses").update(payload).eq("id", editCourseId);
      if (error) { toast.error("Erreur"); return; }
      toast.success("Cours mis à jour !");
    } else {
      const { error } = await supabase.from("pastry_courses").insert(payload);
      if (error) { toast.error("Erreur"); return; }
      toast.success("Cours publié !");
    }
    resetCourseForm(); setShowCourseForm(false); fetchCourses();
  };
  const handleDeleteCourse = async (id: string) => {
    await supabase.from("pastry_courses").delete().eq("id", id);
    toast.success("Cours supprimé"); fetchCourses();
  };
  const toggleCoursePublish = async (id: string, published: boolean) => {
    await supabase.from("pastry_courses").update({ published: !published }).eq("id", id);
    fetchCourses();
    toast.success(published ? "Cours dépublié" : "Cours publié !");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" /> Administration
        </h1>
        <p className="text-muted-foreground text-sm">Gérez les recettes, utilisateurs, cours et monétisation.</p>
      </motion.div>

      <Tabs defaultValue="recipes" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="recipes" className="text-xs">🍽️ Recettes</TabsTrigger>
          <TabsTrigger value="users" className="text-xs">👥 Utilisateurs</TabsTrigger>
          <TabsTrigger value="courses" className="text-xs">📚 Cours</TabsTrigger>
          <TabsTrigger value="monetization" className="text-xs">💰 Monétisation</TabsTrigger>
        </TabsList>

        {/* ── RECETTES TAB ── */}
        <TabsContent value="recipes" className="space-y-4">
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

          <button onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="px-4 py-2 rounded-xl gradient-cobalt text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-4 h-4" /> {showForm ? "Annuler" : "Ajouter une recette"}
          </button>

          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-solid rounded-2xl p-6 space-y-4">
              <h2 className="font-display font-semibold">{editId ? "Modifier la recette" : "Nouvelle recette"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Nom *</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de la recette" className="rounded-lg bg-secondary border-0" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Emoji</label><Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="🍽️" className="rounded-lg bg-secondary border-0" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Calories</label><Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="0" className="rounded-lg bg-secondary border-0" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Protéines (g)</label><Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" className="rounded-lg bg-secondary border-0" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Glucides (g)</label><Input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="0" className="rounded-lg bg-secondary border-0" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Lipides (g)</label><Input type="number" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="0" className="rounded-lg bg-secondary border-0" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Temps de préparation</label><Input value={prepTime} onChange={(e) => setPrepTime(e.target.value)} placeholder="20 min" className="rounded-lg bg-secondary border-0" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Portions</label><Input type="number" value={servings} onChange={(e) => setServings(e.target.value)} placeholder="1" className="rounded-lg bg-secondary border-0" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground">Tags</label><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="poulet, riz, légumes" className="rounded-lg bg-secondary border-0" /></div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Ingrédients</label>
                <div className="space-y-2 mt-1">
                  {ingredients.map((ing, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={ing.name} onChange={(e) => { const next = [...ingredients]; next[i] = { ...next[i], name: e.target.value }; setIngredients(next); }} placeholder="Ingrédient" className="rounded-lg bg-secondary border-0 flex-1" />
                      <Input value={ing.quantity} onChange={(e) => { const next = [...ingredients]; next[i] = { ...next[i], quantity: e.target.value }; setIngredients(next); }} placeholder="Quantité" className="rounded-lg bg-secondary border-0 w-28" />
                      <button onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => setIngredients([...ingredients, { name: "", quantity: "" }])} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Ajouter</button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Étapes</label>
                <div className="space-y-2 mt-1">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="shrink-0 w-5 h-5 rounded-full gradient-cobalt text-primary-foreground text-[10px] flex items-center justify-center font-bold mt-2">{i + 1}</span>
                      <Input value={step} onChange={(e) => { const next = [...steps]; next[i] = e.target.value; setSteps(next); }} placeholder={`Étape ${i + 1}`} className="rounded-lg bg-secondary border-0" />
                      <button onClick={() => setSteps(steps.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80 mt-2"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => setSteps([...steps, ""])} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Ajouter</button>
                </div>
              </div>
              <button onClick={handleSave} className="px-5 py-2 rounded-xl gradient-cobalt text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
                <Save className="w-4 h-4" /> {editId ? "Mettre à jour" : "Enregistrer"}
              </button>
            </motion.div>
          )}

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
                    <button onClick={() => fillForm(r)} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── UTILISATEURS TAB ── */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg">Utilisateurs inscrits ({users.length})</h2>
            <Button size="sm" variant="outline" onClick={fetchUsers} className="ml-auto text-xs">Actualiser</Button>
          </div>
          {loadingUsers ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun utilisateur inscrit pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="glass-card-solid rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {(u.display_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{u.display_name || "Sans nom"}</p>
                    <p className="text-xs text-muted-foreground">ID: {u.user_id.slice(0, 8)}... · Inscrit le {new Date(u.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                  {u.avatar_url && <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── COURS TAB ── */}
        <TabsContent value="courses" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg">Cours de Pâtisserie ({courses.length})</h2>
          </div>

          <button onClick={() => { resetCourseForm(); setShowCourseForm(!showCourseForm); }}
            className="px-4 py-2 rounded-xl gradient-cobalt text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-4 h-4" /> {showCourseForm ? "Annuler" : "Publier un cours"}
          </button>

          {showCourseForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-solid rounded-2xl p-6 space-y-4">
              <h2 className="font-display font-semibold">{editCourseId ? "Modifier le cours" : "Nouveau cours"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Titre *</label><Input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} placeholder="Titre du cours" className="rounded-lg bg-secondary border-0" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Image URL</label><Input value={courseImage} onChange={(e) => setCourseImage(e.target.value)} placeholder="https://..." className="rounded-lg bg-secondary border-0" /></div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Difficulté</label>
                  <select value={courseDifficulty} onChange={(e) => setCourseDifficulty(e.target.value)} className="w-full h-10 rounded-lg bg-secondary border-0 px-3 text-sm">
                    <option value="débutant">Débutant</option>
                    <option value="intermédiaire">Intermédiaire</option>
                    <option value="avancé">Avancé</option>
                  </select>
                </div>
                <div><label className="text-xs font-medium text-muted-foreground">Durée</label><Input value={courseDuration} onChange={(e) => setCourseDuration(e.target.value)} placeholder="45 min" className="rounded-lg bg-secondary border-0" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground">Description</label><Textarea value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} placeholder="Description du cours..." className="rounded-lg bg-secondary border-0 min-h-[80px]" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Contenu détaillé</label><Textarea value={courseContent} onChange={(e) => setCourseContent(e.target.value)} placeholder="Le contenu complet du cours..." className="rounded-lg bg-secondary border-0 min-h-[120px]" /></div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Étapes</label>
                <div className="space-y-2 mt-1">
                  {courseSteps.map((step, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="shrink-0 w-5 h-5 rounded-full gradient-cobalt text-primary-foreground text-[10px] flex items-center justify-center font-bold mt-2">{i + 1}</span>
                      <Input value={step} onChange={(e) => { const next = [...courseSteps]; next[i] = e.target.value; setCourseSteps(next); }} placeholder={`Étape ${i + 1}`} className="rounded-lg bg-secondary border-0" />
                      <button onClick={() => setCourseSteps(courseSteps.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80 mt-2"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => setCourseSteps([...courseSteps, ""])} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Ajouter une étape</button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={coursePublished} onCheckedChange={setCoursePublished} />
                <span className="text-sm">{coursePublished ? "Publié (visible par les utilisateurs)" : "Brouillon (non visible)"}</span>
              </div>
              <button onClick={handleSaveCourse} className="px-5 py-2 rounded-xl gradient-cobalt text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
                <Save className="w-4 h-4" /> {editCourseId ? "Mettre à jour" : "Publier"}
              </button>
            </motion.div>
          )}

          {loadingCourses ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : courses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun cours publié. Créez votre premier cours !</p>
          ) : (
            <div className="space-y-2">
              {courses.map((c) => (
                <div key={c.id} className="glass-card-solid rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">📚</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{c.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.published ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                        {c.published ? "Publié" : "Brouillon"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.difficulty} · {c.duration || "N/A"} · {c.steps.length} étapes</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleCoursePublish(c.id, c.published)} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground text-xs">
                      {c.published ? "Dépublier" : "Publier"}
                    </button>
                    <button onClick={() => fillCourseForm(c)} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteCourse(c.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── MONÉTISATION TAB ── */}
        <TabsContent value="monetization" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg">Paramètres de Monétisation</h2>
          </div>

          <div className="glass-card-solid rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Abonnement Premium</p>
                <p className="text-xs text-muted-foreground">Activer les abonnements payants pour les utilisateurs</p>
              </div>
              <Switch checked={monet.subscriptionEnabled} onCheckedChange={(v) => setMonet({ ...monet, subscriptionEnabled: v })} />
            </div>

            {monet.subscriptionEnabled && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pl-4 border-l-2 border-primary/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Prix mensuel ({monet.currency})</label>
                    <Input value={monet.monthlyPrice} onChange={(e) => setMonet({ ...monet, monthlyPrice: e.target.value })} className="rounded-lg bg-secondary border-0" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Prix annuel ({monet.currency})</label>
                    <Input value={monet.yearlyPrice} onChange={(e) => setMonet({ ...monet, yearlyPrice: e.target.value })} className="rounded-lg bg-secondary border-0" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Devise</label>
                    <select value={monet.currency} onChange={(e) => setMonet({ ...monet, currency: e.target.value })} className="w-full h-10 rounded-lg bg-secondary border-0 px-3 text-sm">
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Période d'essai gratuite</p>
                    <p className="text-xs text-muted-foreground">Offrir un essai gratuit aux nouveaux utilisateurs</p>
                  </div>
                  <Switch checked={monet.freeTrial} onCheckedChange={(v) => setMonet({ ...monet, freeTrial: v })} />
                </div>

                {monet.freeTrial && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Durée de l'essai (jours)</label>
                    <Input value={monet.trialDays} onChange={(e) => setMonet({ ...monet, trialDays: e.target.value })} className="rounded-lg bg-secondary border-0 w-32" type="number" />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Cours premium uniquement</p>
                    <p className="text-xs text-muted-foreground">Restreindre les cours de pâtisserie aux abonnés premium</p>
                  </div>
                  <Switch checked={monet.premiumCoursesOnly} onCheckedChange={(v) => setMonet({ ...monet, premiumCoursesOnly: v })} />
                </div>
              </motion.div>
            )}

            <Button onClick={saveMonetization} className="gradient-cobalt text-primary-foreground">
              <Save className="w-4 h-4 mr-2" /> Sauvegarder les paramètres
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
