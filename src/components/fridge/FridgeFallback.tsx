interface FridgeFallbackProps {
  fridgeItems: string[];
}

const formatLabel = (v: string) =>
  v.split(" ").filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const hasFridgeItem = (items: string[], ...keywords: string[]) =>
  items.some((item) => keywords.some((k) => item.includes(k) || k.includes(item)));

export function FridgeFallback({ fridgeItems }: FridgeFallbackProps) {
  const formattedItems = fridgeItems.map(formatLabel);

  let recipe: { title: string; emoji: string; description: string; steps: string[] };

  if (hasFridgeItem(fridgeItems, "oeuf", "œuf", "oeufs", "œufs")) {
    recipe = {
      title: "Omelette du frigo", emoji: "🍳",
      description: `Une idée express avec : ${formattedItems.join(", ")}.`,
      steps: ["Coupez les ingrédients en morceaux si nécessaire.", "Faites cuire ensemble puis ajoutez aux œufs.", "Laissez prendre et servez."],
    };
  } else if (hasFridgeItem(fridgeItems, "pâtes", "pates")) {
    recipe = {
      title: "Pâtes du frigo", emoji: "🍝",
      description: `Un plat simple avec : ${formattedItems.join(", ")}.`,
      steps: ["Faites cuire les pâtes.", "Préparez et cuisez les autres ingrédients.", "Mélangez le tout et servez."],
    };
  } else if (hasFridgeItem(fridgeItems, "riz")) {
    recipe = {
      title: "Poêlée de riz du frigo", emoji: "🍚",
      description: `Une poêlée improvisée avec : ${formattedItems.join(", ")}.`,
      steps: ["Faites cuire le riz.", "Faites revenir les autres ingrédients.", "Ajoutez le riz, mélangez et servez."],
    };
  } else if (hasFridgeItem(fridgeItems, "salade", "laitue", "tomate", "avocat", "concombre")) {
    recipe = {
      title: "Salade du frigo", emoji: "🥗",
      description: `Une assiette fraîche avec : ${formattedItems.join(", ")}.`,
      steps: ["Lavez et découpez tous les ingrédients.", "Assemblez dans un bol.", "Servez immédiatement."],
    };
  } else if (hasFridgeItem(fridgeItems, "pain")) {
    recipe = {
      title: "Tartines du frigo", emoji: "🥪",
      description: `Des tartines avec : ${formattedItems.join(", ")}.`,
      steps: ["Préparez les ingrédients.", "Garnissez le pain.", "Servez ou passez au chaud."],
    };
  } else {
    recipe = {
      title: "Assiette du frigo", emoji: "🍽️",
      description: `Un plat à faire avec : ${formattedItems.join(", ")}.`,
      steps: ["Préparez et découpez les ingrédients.", "Faites cuire ceux qui doivent l'être.", "Dressez et servez."],
    };
  }

  return (
    <div className="glass-card-solid rounded-2xl p-5 space-y-4">
      <div>
        <p className="text-xs font-medium text-primary mb-2">Suggestion automatique</p>
        <div className="flex items-start gap-3">
          <span className="text-4xl">{recipe.emoji}</span>
          <div>
            <h2 className="text-lg font-display font-semibold">{recipe.title}</h2>
            <p className="text-sm text-muted-foreground">{recipe.description}</p>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Ingrédients utilisés</h3>
        <div className="flex flex-wrap gap-2">
          {fridgeItems.map((item) => (
            <span key={item} className="inline-flex items-center rounded-full bg-secondary px-3 py-1.5 text-sm font-medium">
              {formatLabel(item)}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Préparation</h3>
        <ol className="space-y-2">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-cobalt text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
