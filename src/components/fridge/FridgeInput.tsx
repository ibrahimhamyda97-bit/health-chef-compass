import { useState, KeyboardEvent } from "react";
import { X, Plus, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";

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

interface FridgeInputProps {
  fridgeItems: string[];
  addFridgeItem: (item: string) => void;
  removeFridgeItem: (item: string) => void;
  onItemsChanged: () => void;
}

export function FridgeInput({ fridgeItems, addFridgeItem, removeFridgeItem, onItemsChanged }: FridgeInputProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      addFridgeItem(input);
      setInput("");
      onItemsChanged();
    }
  };

  const suggestions = fridgeItems.length > 0
    ? Array.from(
        new Set(
          fridgeItems.flatMap((item) => {
            const key = Object.keys(ingredientSuggestions).find(
              (k) => item.toLowerCase().includes(k) || k.includes(item.toLowerCase())
            );
            return key ? ingredientSuggestions[key] : [];
          })
        )
      )
        .filter((s) => !fridgeItems.some((fi) => fi.toLowerCase() === s.toLowerCase()))
        .slice(0, 6)
    : [];

  return (
    <div className="space-y-4">
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
              onItemsChanged();
            }
          }}
          className="shrink-0 w-10 h-10 rounded-xl gradient-cobalt flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {fridgeItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {fridgeItems.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 bg-secondary rounded-full px-3 py-1.5 text-sm font-medium"
            >
              {item}
              <button
                onClick={() => { removeFridgeItem(item); onItemsChanged(); }}
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
                onClick={() => { addFridgeItem(suggestion); onItemsChanged(); }}
                className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-3 h-3" /> {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
