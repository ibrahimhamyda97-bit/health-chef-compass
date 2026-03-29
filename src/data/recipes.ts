export interface Recipe {
  id: string;
  name: string;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
  prepTime: string;
  tags: string[];
  ingredients: { name: string; quantity: string }[];
  steps: string[];
  healthy: boolean;
}

export const recipes: Recipe[] = [
  {
    id: "1",
    name: "Bowl Poulet Avocat",
    image: "🥗",
    calories: 420,
    protein: 35,
    carbs: 30,
    fat: 18,
    servings: 1,
    prepTime: "20 min",
    tags: ["poulet", "avocat", "riz", "tomate", "salade"],
    ingredients: [
      { name: "Poulet grillé", quantity: "150g" },
      { name: "Avocat", quantity: "1/2" },
      { name: "Riz complet", quantity: "80g" },
      { name: "Tomates cerises", quantity: "100g" },
      { name: "Salade verte", quantity: "50g" },
      { name: "Sauce soja", quantity: "1 c.à.s" },
    ],
    steps: [
      "Cuire le riz complet selon les instructions.",
      "Griller le poulet avec un filet d'huile d'olive.",
      "Couper l'avocat en tranches et les tomates en deux.",
      "Disposer le riz dans un bol, ajouter le poulet, l'avocat, les tomates et la salade.",
      "Arroser de sauce soja et servir.",
    ],
    healthy: true,
  },
  {
    id: "2",
    name: "Pasta Bolognaise",
    image: "🍝",
    calories: 650,
    protein: 28,
    carbs: 75,
    fat: 22,
    servings: 2,
    prepTime: "35 min",
    tags: ["pâtes", "boeuf", "tomate", "oignon", "ail"],
    ingredients: [
      { name: "Pâtes complètes", quantity: "200g" },
      { name: "Boeuf haché", quantity: "200g" },
      { name: "Sauce tomate", quantity: "200ml" },
      { name: "Oignon", quantity: "1" },
      { name: "Ail", quantity: "2 gousses" },
      { name: "Parmesan", quantity: "30g" },
    ],
    steps: [
      "Faire revenir l'oignon et l'ail émincés dans l'huile.",
      "Ajouter le boeuf haché et faire dorer.",
      "Verser la sauce tomate, assaisonner et laisser mijoter 20 min.",
      "Cuire les pâtes al dente.",
      "Servir les pâtes avec la sauce et le parmesan râpé.",
    ],
    healthy: false,
  },
  {
    id: "3",
    name: "Smoothie Bowl Protéiné",
    image: "🫐",
    calories: 310,
    protein: 22,
    carbs: 40,
    fat: 8,
    servings: 1,
    prepTime: "10 min",
    tags: ["banane", "myrtilles", "yaourt", "granola", "miel"],
    ingredients: [
      { name: "Banane congelée", quantity: "1" },
      { name: "Myrtilles", quantity: "100g" },
      { name: "Yaourt grec", quantity: "150g" },
      { name: "Granola", quantity: "30g" },
      { name: "Miel", quantity: "1 c.à.c" },
      { name: "Graines de chia", quantity: "1 c.à.s" },
    ],
    steps: [
      "Mixer la banane, les myrtilles et le yaourt jusqu'à obtenir une texture épaisse.",
      "Verser dans un bol.",
      "Garnir de granola, graines de chia et un filet de miel.",
    ],
    healthy: true,
  },
  {
    id: "4",
    name: "Salade César Légère",
    image: "🥬",
    calories: 280,
    protein: 20,
    carbs: 15,
    fat: 14,
    servings: 1,
    prepTime: "15 min",
    tags: ["salade", "poulet", "parmesan", "croûtons"],
    ingredients: [
      { name: "Laitue romaine", quantity: "200g" },
      { name: "Poulet grillé", quantity: "120g" },
      { name: "Parmesan", quantity: "20g" },
      { name: "Croûtons", quantity: "30g" },
      { name: "Sauce César légère", quantity: "2 c.à.s" },
    ],
    steps: [
      "Laver et essorer la salade romaine.",
      "Couper le poulet grillé en lamelles.",
      "Assembler la salade avec les croûtons et le parmesan.",
      "Arroser de sauce César et mélanger.",
    ],
    healthy: true,
  },
  {
    id: "5",
    name: "Burger Maison Gourmet",
    image: "🍔",
    calories: 780,
    protein: 38,
    carbs: 55,
    fat: 42,
    servings: 1,
    prepTime: "25 min",
    tags: ["boeuf", "pain", "fromage", "salade", "tomate"],
    ingredients: [
      { name: "Steak haché", quantity: "150g" },
      { name: "Pain burger", quantity: "1" },
      { name: "Cheddar", quantity: "1 tranche" },
      { name: "Salade", quantity: "2 feuilles" },
      { name: "Tomate", quantity: "2 tranches" },
      { name: "Oignon rouge", quantity: "3 rondelles" },
    ],
    steps: [
      "Former le steak et le cuire à la poêle bien chaude.",
      "Toaster le pain burger.",
      "Monter le burger : pain, salade, steak, fromage, tomate, oignon.",
      "Servir avec une sauce maison.",
    ],
    healthy: false,
  },
  {
    id: "6",
    name: "Saumon Teriyaki",
    image: "🐟",
    calories: 380,
    protein: 32,
    carbs: 25,
    fat: 16,
    servings: 1,
    prepTime: "20 min",
    tags: ["saumon", "riz", "sauce soja", "légumes"],
    ingredients: [
      { name: "Filet de saumon", quantity: "150g" },
      { name: "Sauce teriyaki", quantity: "3 c.à.s" },
      { name: "Riz basmati", quantity: "80g" },
      { name: "Brocoli", quantity: "100g" },
      { name: "Graines de sésame", quantity: "1 c.à.c" },
    ],
    steps: [
      "Mariner le saumon dans la sauce teriyaki pendant 10 min.",
      "Cuire le riz et le brocoli à la vapeur.",
      "Poêler le saumon 3-4 min de chaque côté.",
      "Servir avec le riz, le brocoli et parsemer de sésame.",
    ],
    healthy: true,
  },
];
