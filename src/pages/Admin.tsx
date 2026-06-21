import { useState, useEffect } from "react";
import { recipes as defaultRecipes, Recipe } from "@/data/recipes";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Plus, X, Trash2, Edit, Save, Users, BookOpen, DollarSign, Cake, Image, Video, Eye, EyeOff, TrendingUp, Settings2, Tag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import MediaUploadButton from "@/components/admin/MediaUploadButton";

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
  photos: string[];
  videos: string[];
}

interface EventCake {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  base_price: number;
  event_type: string;
  servings_min: number;
  servings_max: number;
  available: boolean;
  options: any[];
  created_at: string;
}

const EVENT_TYPES = [
  { value: "anniversaire", label: "🎂 Anniversaire" },
  { value: "mariage", label: "💍 Mariage" },
  { value: "bapteme", label: "👶 Baptême" },
  { value: "entreprise", label: "🏢 Entreprise" },
  { value: "autre", label: "🎉 Autre" },
];

const GATED_FEATURES = [
  { key: "courses", label: "Cours de Pâtisserie", desc: "Accès aux cours publiés" },
  { key: "fridge_ai", label: "HamIA Recettes", desc: "Génération de recettes par IA" },
  { key: "plating", label: "Art du Dressage", desc: "Galerie et techniques de dressage" },
  { key: "planning", label: "Planning Repas", desc: "Planification hebdomadaire des repas" },
  { key: "event_cakes", label: "Gâteaux Événementiels", desc: "Commande de gâteaux sur mesure" },
];

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

  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

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
  const [coursePhotos, setCoursePhotos] = useState<string[]>([]);
  const [courseVideos, setCourseVideos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");

  // Monetization
  const [monet, setMonet] = useState({
    subscriptionEnabled: false,
    monthlyPrice: "9.99",
    yearlyPrice: "99.99",
    freeTrial: true,
    trialDays: "7",
    premiumCoursesOnly: false,
    currency: "EUR",
    gatedFeatures: {} as Record<string, boolean>,
  });

  // Event Cakes
  const [cakes, setCakes] = useState<EventCake[]>([]);
  const [loadingCakes, setLoadingCakes] = useState(false);
  const [showCakeForm, setShowCakeForm] = useState(false);
  const [editCakeId, setEditCakeId] = useState<string | null>(null);
  const [cakeName, setCakeName] = useState("");
  const [cakeDesc, setCakeDesc] = useState("");
  const [cakeImage, setCakeImage] = useState("");
  const [cakePrice, setCakePrice] = useState("");
  const [cakeEventType, setCakeEventType] = useState("anniversaire");
  const [cakeServMin, setCakeServMin] = useState("6");
  const [cakeServMax, setCakeServMax] = useState("50");
  const [cakeAvailable, setCakeAvailable] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchCourses();
    fetchMonetization();
    fetchCakes();
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
    if (data) setCourses(data.map((c: any) => ({
      ...c,
      steps: Array.isArray(c.steps) ? c.steps : [],
      photos: Array.isArray(c.photos) ? c.photos : [],
      videos: Array.isArray(c.videos) ? c.videos : [],
    })) as PastryCourse[]);
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

  const fetchCakes = async () => {
    setLoadingCakes(true);
    const { data } = await supabase.from("event_cakes").select("*").order("created_at", { ascending: false });
    if (data) setCakes(data as EventCake[]);
    setLoadingCakes(false);
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
    setCourseDuration(""); setCourseContent(""); setCourseSteps([""]); setCoursePublished(false);
    setEditCourseId(null); setCoursePhotos([]); setCourseVideos([]); setNewPhotoUrl(""); setNewVideoUrl("");
  };
  const fillCourseForm = (c: PastryCourse) => {
    setCourseTitle(c.title); setCourseDesc(c.description || ""); setCourseImage(c.image_url || "");
    setCourseDifficulty(c.difficulty); setCourseDuration(c.duration || "");
    setCourseContent(c.content || ""); setCourseSteps(c.steps.length > 0 ? c.steps : [""]); setCoursePublished(c.published);
    setEditCourseId(c.id); setCoursePhotos(c.photos || []); setCourseVideos(c.videos || []);
  };
  const handleSaveCourse = async () => {
    if (!courseTitle.trim()) { toast.error("Le titre est requis"); return; }
    const payload = {
      title: courseTitle.trim(), description: courseDesc || null, image_url: courseImage || null,
      difficulty: courseDifficulty, duration: courseDuration || null, content: courseContent || null,
      steps: courseSteps.filter((s) => s.trim()), published: coursePublished,
      photos: coursePhotos, videos: courseVideos,
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

  // ── Cake CRUD ──
  const resetCakeForm = () => {
    setCakeName(""); setCakeDesc(""); setCakeImage(""); setCakePrice("");
    setCakeEventType("anniversaire"); setCakeServMin("6"); setCakeServMax("50");
    setCakeAvailable(true); setEditCakeId(null);
  };
  const fillCakeForm = (c: EventCake) => {
    setCakeName(c.name); setCakeDesc(c.description || ""); setCakeImage(c.image_url || "");
    setCakePrice(String(c.base_price)); setCakeEventType(c.event_type);
    setCakeServMin(String(c.servings_min)); setCakeServMax(String(c.servings_max));
    setCakeAvailable(c.available); setEditCakeId(c.id); setShowCakeForm(true);
  };
  const handleSaveCake = async () => {
    if (!cakeName.trim()) { toast.error("Le nom est requis"); return; }
    const payload = {
      name: cakeName.trim(), description: cakeDesc || null, image_url: cakeImage || null,
      base_price: parseFloat(cakePrice) || 0, event_type: cakeEventType,
      servings_min: parseInt(cakeServMin) || 6, servings_max: parseInt(cakeServMax) || 50,
      available: cakeAvailable,
    };
    if (editCakeId) {
      const { error } = await supabase.from("event_cakes").update(payload).eq("id", editCakeId);
      if (error) { toast.error("Erreur"); return; }
      toast.success("Gâteau mis à jour !");
    } else {
      const { error } = await supabase.from("event_cakes").insert(payload);
      if (error) { toast.error("Erreur"); return; }
      toast.success("Gâteau ajouté !");
    }
    resetCakeForm(); setShowCakeForm(false); fetchCakes();
  };
  const handleDeleteCake = async (id: string) => {
    await supabase.from("event_cakes").delete().eq("id", id);
    toast.success("Gâteau supprimé"); fetchCakes();
  };
  const toggleCakeAvailable = async (id: string, available: boolean) => {
    await supabase.from("event_cakes").update({ available: !available }).eq("id", id);
    fetchCakes();
    toast.success(available ? "Gâteau masqué" : "Gâteau visible !");
  };

  const StatCard = ({ icon, label, value, color = "text-primary" }: { icon: React.ReactNode; label: string; value: string | number; color?: string }) => (
    <div className="glass-card-solid rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" /> Administration
          </h1>
          <p className="text-muted-foreground text-sm">Tableau de bord de gestion Tableau de Board</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">v2.0</Badge>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Recettes" value={allRecipes.length} />
        <StatCard icon={<Users className="w-5 h-5" />} label="Utilisateurs" value={users.length} />
        <StatCard icon={<BookOpen className="w-5 h-5" />} label="Cours" value={courses.length} />
        <StatCard icon={<Cake className="w-5 h-5" />} label="Gâteaux" value={cakes.length} />
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="Premium" value={monet.subscriptionEnabled ? "Actif" : "Inactif"} />
      </div>

      <Tabs defaultValue="recipes" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl bg-card border border-border rounded-xl p-1">
          <TabsTrigger value="recipes" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">🍽️ Recettes</TabsTrigger>
          <TabsTrigger value="users" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">👥 Users</TabsTrigger>
          <TabsTrigger value="courses" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">📚 Cours</TabsTrigger>
          <TabsTrigger value="cakes" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">🎂 Gâteaux</TabsTrigger>
          <TabsTrigger value="monetization" className="text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">💰 Monét.</TabsTrigger>
        </TabsList>

        {/* ── RECETTES TAB ── */}
        <TabsContent value="recipes" className="space-y-4">
          <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className="gradient-cobalt text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> {showForm ? "Annuler" : "Ajouter une recette"}
          </Button>

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
              <Button onClick={handleSave} className="gradient-cobalt text-primary-foreground gap-2">
                <Save className="w-4 h-4" /> {editId ? "Mettre à jour" : "Enregistrer"}
              </Button>
            </motion.div>
          )}

          <div className="space-y-2">
            <h2 className="font-display font-semibold">Toutes les recettes ({allRecipes.length})</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {allRecipes.map((r) => (
                <div key={r.id} className="glass-card-solid rounded-xl p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
                  <span className="text-2xl">{r.image}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.calories} kcal · {r.ingredients.length} ingr. · {r.prepTime}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => fillForm(r)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
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
            <p className="text-sm text-muted-foreground text-center py-8">Aucun utilisateur inscrit.</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="glass-card-solid rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {(u.display_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{u.display_name || "Sans nom"}</p>
                    <p className="text-xs text-muted-foreground">Inscrit le {new Date(u.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                  {u.avatar_url && <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── COURS TAB (with photos/videos) ── */}
        <TabsContent value="courses" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg">Cours de Pâtisserie ({courses.length})</h2>
          </div>

          <Button onClick={() => { resetCourseForm(); setShowCourseForm(!showCourseForm); }} className="gradient-cobalt text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> {showCourseForm ? "Annuler" : "Publier un cours"}
          </Button>

          {showCourseForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-solid rounded-2xl p-6 space-y-4">
              <h2 className="font-display font-semibold">{editCourseId ? "Modifier le cours" : "Nouveau cours"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Titre *</label><Input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} placeholder="Titre du cours" className="rounded-lg bg-secondary border-0" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Image principale URL</label><Input value={courseImage} onChange={(e) => setCourseImage(e.target.value)} placeholder="https://..." className="rounded-lg bg-secondary border-0" /></div>
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

              {/* Photos section */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Image className="w-3 h-3" /> Photos du cours</label>
                <div className="flex gap-2 flex-wrap">
                  {coursePhotos.map((p, i) => (
                    <div key={i} className="relative group">
                      <img src={p} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      <button onClick={() => setCoursePhotos(coursePhotos.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Input value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} placeholder="URL de la photo (ou upload)" className="rounded-lg bg-secondary border-0 flex-1 min-w-[200px]" />
                  <Button size="sm" variant="outline" onClick={() => { if (newPhotoUrl.trim()) { setCoursePhotos([...coursePhotos, newPhotoUrl.trim()]); setNewPhotoUrl(""); } }}>
                    <Plus className="w-3 h-3" />
                  </Button>
                  <MediaUploadButton
                    accept="image/*"
                    label="Uploader photo"
                    maxMb={15}
                    onUploaded={(url) => setCoursePhotos((prev) => [...prev, url])}
                  />
                </div>
              </div>

              {/* Videos section */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Video className="w-3 h-3" /> Vidéos du cours</label>
                <div className="flex gap-2 flex-wrap">
                  {courseVideos.map((v, i) => (
                    <div key={i} className="flex items-center gap-1 bg-secondary rounded-lg px-2 py-1 text-xs">
                      <Video className="w-3 h-3 text-primary" />
                      <span className="truncate max-w-[120px]">{v}</span>
                      <button onClick={() => setCourseVideos(courseVideos.filter((_, j) => j !== i))} className="text-destructive"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Input value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} placeholder="URL de la vidéo (ou upload)" className="rounded-lg bg-secondary border-0 flex-1 min-w-[200px]" />
                  <Button size="sm" variant="outline" onClick={() => { if (newVideoUrl.trim()) { setCourseVideos([...courseVideos, newVideoUrl.trim()]); setNewVideoUrl(""); } }}>
                    <Plus className="w-3 h-3" />
                  </Button>
                  <MediaUploadButton
                    accept="video/*"
                    label="Uploader vidéo"
                    maxMb={200}
                    onUploaded={(url) => setCourseVideos((prev) => [...prev, url])}
                  />
                </div>
              </div>

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
                <span className="text-sm">{coursePublished ? "Publié" : "Brouillon"}</span>
              </div>
              <Button onClick={handleSaveCourse} className="gradient-cobalt text-primary-foreground gap-2">
                <Save className="w-4 h-4" /> {editCourseId ? "Mettre à jour" : "Publier"}
              </Button>
            </motion.div>
          )}

          {loadingCourses ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : courses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun cours. Créez votre premier !</p>
          ) : (
            <div className="space-y-2">
              {courses.map((c) => (
                <div key={c.id} className="glass-card-solid rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                  {c.image_url ? (
                    <img src={c.image_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg">📚</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{c.title}</p>
                      <Badge variant={c.published ? "default" : "secondary"} className="text-[10px]">
                        {c.published ? "Publié" : "Brouillon"}
                      </Badge>
                      {c.photos.length > 0 && <Badge variant="outline" className="text-[10px] gap-0.5"><Image className="w-2.5 h-2.5" />{c.photos.length}</Badge>}
                      {c.videos.length > 0 && <Badge variant="outline" className="text-[10px] gap-0.5"><Video className="w-2.5 h-2.5" />{c.videos.length}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{c.difficulty} · {c.duration || "N/A"} · {c.steps.length} étapes</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => toggleCoursePublish(c.id, c.published)} title={c.published ? "Dépublier" : "Publier"}>
                      {c.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => fillCourseForm(c)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCourse(c.id)} className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── GÂTEAUX ÉVÉNEMENTIELS TAB ── */}
        <TabsContent value="cakes" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Cake className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg">Gâteaux Événementiels ({cakes.length})</h2>
          </div>
          <p className="text-xs text-muted-foreground">Créez et gérez votre catalogue de gâteaux pour anniversaires, mariages et autres événements.</p>

          <Button onClick={() => { resetCakeForm(); setShowCakeForm(!showCakeForm); }} className="gradient-cobalt text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> {showCakeForm ? "Annuler" : "Ajouter un gâteau"}
          </Button>

          {showCakeForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-solid rounded-2xl p-6 space-y-4">
              <h2 className="font-display font-semibold">{editCakeId ? "Modifier le gâteau" : "Nouveau gâteau"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Nom *</label><Input value={cakeName} onChange={(e) => setCakeName(e.target.value)} placeholder="Wedding Cake Royal" className="rounded-lg bg-secondary border-0" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Image URL</label><Input value={cakeImage} onChange={(e) => setCakeImage(e.target.value)} placeholder="https://..." className="rounded-lg bg-secondary border-0" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Prix de base (€)</label><Input type="number" value={cakePrice} onChange={(e) => setCakePrice(e.target.value)} placeholder="50" className="rounded-lg bg-secondary border-0" /></div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Type d'événement</label>
                  <select value={cakeEventType} onChange={(e) => setCakeEventType(e.target.value)} className="w-full h-10 rounded-lg bg-secondary border-0 px-3 text-sm">
                    {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-medium text-muted-foreground">Portions min</label><Input type="number" value={cakeServMin} onChange={(e) => setCakeServMin(e.target.value)} className="rounded-lg bg-secondary border-0" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Portions max</label><Input type="number" value={cakeServMax} onChange={(e) => setCakeServMax(e.target.value)} className="rounded-lg bg-secondary border-0" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground">Description</label><Textarea value={cakeDesc} onChange={(e) => setCakeDesc(e.target.value)} placeholder="Décrivez le gâteau, ses saveurs, la décoration..." className="rounded-lg bg-secondary border-0 min-h-[80px]" /></div>
              <div className="flex items-center gap-3">
                <Switch checked={cakeAvailable} onCheckedChange={setCakeAvailable} />
                <span className="text-sm">{cakeAvailable ? "Disponible à la commande" : "Non disponible"}</span>
              </div>
              <Button onClick={handleSaveCake} className="gradient-cobalt text-primary-foreground gap-2">
                <Save className="w-4 h-4" /> {editCakeId ? "Mettre à jour" : "Ajouter"}
              </Button>
            </motion.div>
          )}

          {loadingCakes ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : cakes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-4xl mb-2">🎂</p>
              <p>Aucun gâteau. Ajoutez votre premier gâteau événementiel !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cakes.map((c) => (
                <div key={c.id} className="glass-card-solid rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                  {c.image_url && <img src={c.image_url} alt={c.name} className="w-full h-36 object-cover" />}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-sm">{c.name}</h3>
                      <Badge variant="outline" className="text-[10px]">
                        {EVENT_TYPES.find((t) => t.value === c.event_type)?.label || c.event_type}
                      </Badge>
                    </div>
                    {c.description && <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-primary">{c.base_price}€</p>
                        <p className="text-[10px] text-muted-foreground">{c.servings_min}–{c.servings_max} parts</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => toggleCakeAvailable(c.id, c.available)} title={c.available ? "Masquer" : "Rendre visible"}>
                          {c.available ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => fillCakeForm(c)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCake(c.id)} className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
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
            <h2 className="font-display font-semibold text-lg">Monétisation & Fonctionnalités Premium</h2>
          </div>

          <div className="glass-card-solid rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Abonnement Premium</p>
                <p className="text-xs text-muted-foreground">Activer les abonnements payants</p>
              </div>
              <Switch checked={monet.subscriptionEnabled} onCheckedChange={(v) => setMonet({ ...monet, subscriptionEnabled: v })} />
            </div>

            {monet.subscriptionEnabled && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 pl-4 border-l-2 border-primary/20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <p className="font-medium text-sm">Période d'essai</p>
                    <p className="text-xs text-muted-foreground">Offrir un essai gratuit</p>
                  </div>
                  <Switch checked={monet.freeTrial} onCheckedChange={(v) => setMonet({ ...monet, freeTrial: v })} />
                </div>
                {monet.freeTrial && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Durée (jours)</label>
                    <Input value={monet.trialDays} onChange={(e) => setMonet({ ...monet, trialDays: e.target.value })} className="rounded-lg bg-secondary border-0 w-32" type="number" />
                  </div>
                )}

                {/* Programmable feature gating */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-primary" />
                    <p className="font-medium text-sm">Fonctionnalités Premium</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Choisissez quelles fonctionnalités sont réservées aux abonnés premium :</p>
                  <div className="space-y-2">
                    {GATED_FEATURES.map((feat) => (
                      <div key={feat.key} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{feat.label}</p>
                            <p className="text-[10px] text-muted-foreground">{feat.desc}</p>
                          </div>
                        </div>
                        <Switch
                          checked={monet.gatedFeatures?.[feat.key] || false}
                          onCheckedChange={(v) => setMonet({
                            ...monet,
                            gatedFeatures: { ...monet.gatedFeatures, [feat.key]: v }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <Button onClick={saveMonetization} className="gradient-cobalt text-primary-foreground gap-2">
              <Save className="w-4 h-4" /> Sauvegarder les paramètres
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
