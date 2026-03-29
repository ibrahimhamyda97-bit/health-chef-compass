import { createContext, useContext, useState, ReactNode } from "react";

type Mode = "perte" | "masse";

interface NutritionContextType {
  mode: Mode;
  setMode: (m: Mode) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  fridgeItems: string[];
  addFridgeItem: (item: string) => void;
  removeFridgeItem: (item: string) => void;
  cart: string[];
  toggleCart: (id: string) => void;
  isInCart: (id: string) => boolean;
  shoppingItems: { name: string; quantity: string }[];
  addShoppingItems: (items: { name: string; quantity: string }[]) => void;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export function NutritionProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("perte");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [fridgeItems, setFridgeItems] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [shoppingItems, setShoppingItems] = useState<{ name: string; quantity: string }[]>([]);

  const addShoppingItems = (items: { name: string; quantity: string }[]) => {
    setShoppingItems((prev) => {
      const existing = new Set(prev.map((i) => i.name.toLowerCase()));
      const newItems = items.filter((i) => !existing.has(i.name.toLowerCase()));
      return [...prev, ...newItems];
    });
  };

  const toggleFavorite = (id: string) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );

  const addFridgeItem = (item: string) => {
    const trimmed = item.trim().toLowerCase();
    if (trimmed && !fridgeItems.includes(trimmed)) {
      setFridgeItems((prev) => [...prev, trimmed]);
    }
  };

  const removeFridgeItem = (item: string) =>
    setFridgeItems((prev) => prev.filter((i) => i !== item));

  const toggleCart = (id: string) =>
    setCart((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const isInCart = (id: string) => cart.includes(id);

  return (
    <NutritionContext.Provider
      value={{ mode, setMode, favorites, toggleFavorite, fridgeItems, addFridgeItem, removeFridgeItem, cart, toggleCart, isInCart, shoppingItems, addShoppingItems }}
    >
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutrition() {
  const ctx = useContext(NutritionContext);
  if (ctx === undefined) throw new Error("useNutrition must be used within NutritionProvider");
  return ctx;
}
