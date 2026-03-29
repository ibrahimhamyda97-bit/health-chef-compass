import { useState, useMemo, KeyboardEvent } from "react";
import { useNutrition } from "@/context/NutritionContext";
import { recipes } from "@/data/recipes";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus, Share2, Carrot, Beef, ShoppingBag, Milk, X, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Category = "Légumes" | "Protéines" | "Épicerie" | "Produits Laitiers";

const categoryConfig: Record<Category, { icon: typeof Carrot; color: string }> = {
  "Légumes": { icon: Carrot, color: "text-emerald" },
  "Protéines": { icon: Beef, color: "text-red-500" },
  "Épicerie": { icon: ShoppingBag, color: "text-cobalt" },
  "Produits Laitiers": { icon: Milk, color: "text-amber-500" },
};

const ingredientCategories: Record<string, Category> = {
  "épinards": "Légumes", "brocoli": "Légumes", "tomates cerises": "Légumes", "tomates": "Légumes",
  "tomate": "Légumes", "salade verte": "Légumes", "laitue romaine": "Légumes", "concombre": "Légumes",
  "courgettes": "Légumes", "oignon": "Légumes", "oignon rouge": "Légumes", "ail": "Légumes",
  "poivron rouge": "Légumes", "haricots verts": "Légumes", "champignons de paris": "Légumes",
  "menthe fraîche": "Légumes", "basilic frais": "Légumes", "oignon vert": "Légumes",
  "avocat": "Légumes", "mangue": "Légumes", "banane": "Légumes", "banane mûre": "Légumes",
  "banane congelée": "Légumes", "myrtilles": "Légumes", "citron": "Légumes",

  "poulet grillé": "Protéines", "blancs de poulet": "Protéines", "boeuf haché": "Protéines",
  "bœuf haché": "Protéines", "steak haché": "Protéines", "filet de saumon": "Protéines",
  "steak de thon": "Protéines", "thon en boîte": "Protéines", "crevettes cuites": "Protéines",
  "tofu soyeux": "Protéines", "œufs": "Protéines", "edamame": "Protéines",

  "gruyère râpé": "Produits Laitiers", "parmesan": "Produits Laitiers", "cheddar": "Produits Laitiers",
  "mozzarella": "Produits Laitiers", "yaourt grec": "Produits Laitiers", "yaourt nature": "Produits Laitiers",
  "crème fraîche": "Produits Laitiers", "crème de coco": "Produits Laitiers", "beurre": "Produits Laitiers",
  "lait": "Produits Laitiers", "fromage": "Produits Laitiers",

  "riz complet": "Épicerie", "riz basmati": "Épicerie", "riz à sushi": "Épicerie",
  "riz arborio": "Épicerie", "pâtes complètes": "Épicerie", "quinoa": "Épicerie",
  "flocons d'avoine": "Épicerie", "tortilla complète": "Épicerie", "pain burger": "Épicerie",
  "pâte à pizza": "Épicerie", "sauce soja": "Épicerie", "sauce teriyaki": "Épicerie",
  "sauce tomate": "Épicerie", "tomates concassées": "Épicerie", "sauce césar légère": "Épicerie",
  "épices tikka masala": "Épicerie", "cumin": "Épicerie", "piment": "Épicerie",
  "pâte miso": "Épicerie", "algues wakame": "Épicerie", "graines de sésame": "Épicerie",
  "graines de chia": "Épicerie", "granola": "Épicerie", "croûtons": "Épicerie",
  "miel": "Épicerie", "huile d'olive": "Épicerie", "jus de citron": "Épicerie",
  "bouillon de légumes": "Épicerie", "haricots rouges": "Épicerie",
  "eau chaude": "Épicerie", "salade": "Légumes",
};

function getCategory(name: string): Category {
  return ingredientCategories[name.toLowerCase()] || "Épicerie";
}

interface ShoppingItem {
  name: string;
  quantity: string;
  category: Category;
  checked: boolean;
  manual?: boolean;
}

export default function ShoppingList() {
  const { cart } = useNutrition();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [manualItems, setManualItems] = useState<ShoppingItem[]>([]);
  const [input, setInput] = useState("");

  const mergedItems = useMemo(() => {
    const cartRecipes = recipes.filter((r) => cart.includes(r.id));
    const map = new Map<string, { quantity: string; category: Category }>();

    for (const recipe of cartRecipes) {
      for (const ing of recipe.ingredients) {
        const key = ing.name.toLowerCase();
        if (map.has(key)) {
          const existing = map.get(key)!;
          existing.quantity = mergeQuantities(existing.quantity, ing.quantity);
        } else {
          map.set(key, { quantity: ing.quantity, category: getCategory(ing.name) });
        }
      }
    }

    const items: ShoppingItem[] = [];
    map.forEach((val, key) => {
      items.push({ name: key.charAt(0).toUpperCase() + key.slice(1), quantity: val.quantity, category: val.category, checked: false });
    });

    return items;
  }, [cart]);

  const allItems = [...mergedItems, ...manualItems];

  const grouped = useMemo(() => {
    const groups: Record<Category, ShoppingItem[]> = {
      "Légumes": [], "Protéines": [], "Épicerie": [], "Produits Laitiers": [],
    };
    for (const item of allItems) {
      groups[item.category].push(item);
    }
    return groups;
  }, [allItems]);

  const toggleCheck = (name: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const addManualItem = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setManualItems((prev) => [...prev, { name: trimmed, quantity: "1", category: "Épicerie", checked: false, manual: true }]);
    setInput("");
  };

  const removeManualItem = (name: string) => {
    setManualItems((prev) => prev.filter((i) => i.name !== name));
    setCheckedItems((prev) => { const next = new Set(prev); next.delete(name); return next; });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addManualItem();
  };

  const handleShare = async () => {
    const unchecked = allItems.filter((i) => !checkedItems.has(i.name));
    const text = Object.entries(grouped)
      .map(([cat, items]) => {
        const catItems = items.filter((i) => !checkedItems.has(i.name));
        if (catItems.length === 0) return null;
        return `📍 ${cat}\n${catItems.map((i) => `  ☐ ${i.name} — ${i.quantity}`).join("\n")}`;
      })
      .filter(Boolean)
      .join("\n\n");

    const fullText = `🛒 Ma Liste de Courses - NutriDash\n\n${text}\n\n${unchecked.length} article(s) restant(s)`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Ma Liste de Courses", text: fullText });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(fullText);
      toast.success("Liste copiée dans le presse-papiers !");
    }
  };

  const checkedCount = allItems.filter((i) => checkedItems.has(i.name)).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Liste de Courses 🛒</h1>
        <p className="text-muted-foreground text-sm">
          {cart.length > 0
            ? `${allItems.length} article(s) · ${checkedCount} coché(s) · ${cart.length} recette(s) au panier`
            : "Ajoutez des recettes à votre panier pour générer la liste."}
        </p>
      </motion.div>

      {/* Quick add */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card-solid rounded-2xl p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ajouter un article rapide..."
            className="rounded-xl bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <button
            onClick={addManualItem}
            className="shrink-0 w-10 h-10 rounded-xl gradient-cobalt flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {allItems.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-5xl mb-3">🛒</p>
          <p className="font-medium">Votre liste est vide</p>
          <p className="text-sm mt-1">Cliquez sur l'icône 🛒 d'une recette pour l'ajouter au panier.</p>
        </div>
      )}

      {/* Categorized list */}
      {(Object.entries(grouped) as [Category, ShoppingItem[]][]).map(([category, items], groupIdx) => {
        if (items.length === 0) return null;
        const config = categoryConfig[category];
        const Icon = config.icon;

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + groupIdx * 0.05 }}
            className="glass-card-solid rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Icon className={`w-5 h-5 ${config.color}`} />
              <h2 className="font-display font-semibold">{category}</h2>
              <span className="text-xs text-muted-foreground ml-auto">{items.length} article(s)</span>
            </div>
            <ul className="space-y-1">
              {items.map((item) => {
                const checked = checkedItems.has(item.name);
                return (
                  <li
                    key={item.name}
                    className={`flex items-center gap-3 py-2.5 px-2 rounded-lg transition-colors ${
                      checked ? "opacity-50" : "hover:bg-secondary/50"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleCheck(item.name)}
                      className="rounded-md"
                    />
                    <span className={`flex-1 text-sm transition-all ${checked ? "line-through text-muted-foreground" : ""}`}>
                      {item.name}
                    </span>
                    <span className={`text-xs font-medium ${checked ? "line-through text-muted-foreground" : "text-muted-foreground"}`}>
                      {item.quantity}
                    </span>
                    {item.manual && (
                      <button onClick={() => removeManualItem(item.name)} className="p-1 hover:text-destructive transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        );
      })}

      {/* Share button */}
      {allItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <button
            onClick={handleShare}
            className="w-full gradient-cobalt text-primary-foreground rounded-2xl py-3.5 font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Share2 className="w-4 h-4" />
            Partager ma liste
          </button>
        </motion.div>
      )}
    </div>
  );
}

function mergeQuantities(a: string, b: string): string {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  if (!isNaN(numA) && !isNaN(numB)) {
    const unitA = a.replace(/[\d.,\s/]+/, "").trim();
    const unitB = b.replace(/[\d.,\s/]+/, "").trim();
    if (unitA === unitB) return `${numA + numB}${unitA ? unitA : ""}`;
  }
  return `${a} + ${b}`;
}
