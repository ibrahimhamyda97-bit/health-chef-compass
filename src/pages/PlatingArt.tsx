import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Droplets, Palette, Mountain, Wind, Leaf, X } from "lucide-react";

import platingEntree1 from "@/assets/plating-entree-1.jpg";
import platingEntree2 from "@/assets/plating-entree-2.jpg";
import platingPlat1 from "@/assets/plating-plat-1.jpg";
import platingPlat2 from "@/assets/plating-plat-2.jpg";
import platingDessert1 from "@/assets/plating-dessert-1.jpg";
import platingDessert2 from "@/assets/plating-dessert-2.jpg";

interface Annotation {
  x: number; // percentage
  y: number;
  label: string;
}

interface PlatingItem {
  id: string;
  title: string;
  image: string;
  annotations: Annotation[];
}

interface Category {
  name: string;
  emoji: string;
  items: PlatingItem[];
}

const categories: Category[] = [
  {
    name: "Entrées Graphiques",
    emoji: "🎨",
    items: [
      {
        id: "e1",
        title: "Le Cercle de Pesto",
        image: platingEntree1,
        annotations: [
          { x: 50, y: 40, label: "Utilisation d'un emporte-pièce rond pour un cercle parfait" },
          { x: 72, y: 25, label: "Micro-pousses disposées à la pince" },
          { x: 30, y: 70, label: "Fleurs comestibles pour la couleur" },
        ],
      },
      {
        id: "e2",
        title: "La Fleur de Betterave",
        image: platingEntree2,
        annotations: [
          { x: 50, y: 50, label: "Quenelle de fromage de chèvre à la cuillère" },
          { x: 35, y: 35, label: "Carpaccio taillé à la mandoline très fine" },
          { x: 60, y: 30, label: "Feuille d'or pour la touche premium" },
        ],
      },
    ],
  },
  {
    name: "Plats Structurés",
    emoji: "🏗️",
    items: [
      {
        id: "p1",
        title: "La Tour de Légumes",
        image: platingPlat1,
        annotations: [
          { x: 50, y: 20, label: "Herbe fraîche en couronne au sommet" },
          { x: 50, y: 50, label: "Empilage avec un cercle de présentation" },
          { x: 55, y: 80, label: "Réduction de balsamique en filet précis" },
        ],
      },
      {
        id: "p2",
        title: "L'Éventail de Magret",
        image: platingPlat2,
        annotations: [
          { x: 48, y: 45, label: "Tranches en éventail régulier au couteau aiguisé" },
          { x: 50, y: 65, label: "Purée en quenelle lisse à la cuillère chaude" },
          { x: 30, y: 60, label: "Points de jus à la pipette" },
        ],
      },
    ],
  },
  {
    name: "Desserts Artistiques",
    emoji: "✨",
    items: [
      {
        id: "d1",
        title: "La Sphère Chocolat",
        image: platingDessert1,
        annotations: [
          { x: 55, y: 35, label: "Sphère moulée dans un moule en silicone" },
          { x: 35, y: 65, label: "Points de coulis à la pipette" },
          { x: 60, y: 25, label: "Poudre d'or saupoudrée au tamis fin" },
        ],
      },
      {
        id: "d2",
        title: "La Tarte Déstructurée",
        image: platingDessert2,
        annotations: [
          { x: 50, y: 40, label: "Meringues pochées à la douille Saint-Honoré" },
          { x: 35, y: 70, label: "Virgule de coulis au dos de la cuillère" },
          { x: 65, y: 55, label: "Fleurs comestibles pour la touche finale" },
        ],
      },
    ],
  },
];

const goldenRules = [
  { icon: Sparkles, title: "Propreté", desc: "Bords de l'assiette impeccables, essuyés au torchon humide." },
  { icon: Palette, title: "Harmonie des couleurs", desc: "3 couleurs max pour un visuel équilibré et appétissant." },
  { icon: Mountain, title: "Volume et hauteur", desc: "Jouer sur les niveaux pour créer de la profondeur." },
  { icon: Wind, title: "Espacement", desc: "Laisser respirer chaque élément — le vide est un allié." },
  { icon: Leaf, title: "La touche finale", desc: "Herbes fraîches, épices colorées ou feuille d'or." },
];

function PlatingCard({ item }: { item: PlatingItem }) {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-2xl overflow-hidden border border-[hsl(45,60%,40%,0.3)] bg-[hsl(0,0%,12%)]"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          width={640}
          height={640}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

        {/* Annotation dots — visible on hover */}
        {item.annotations.map((ann, i) => (
          <button
            key={i}
            onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)}
            style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
            className="absolute z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1/2 -translate-y-1/2"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(45,70%,50%)] text-[hsl(0,0%,10%)] text-[10px] font-bold shadow-lg ring-2 ring-[hsl(45,70%,50%,0.4)] animate-pulse hover:animate-none hover:scale-125 transition-transform cursor-pointer">
              {i + 1}
            </span>
          </button>
        ))}

        {/* Active annotation tooltip */}
        <AnimatePresence>
          {activeAnnotation !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-black/50 z-20"
            >
              <div className="flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[hsl(45,70%,50%)] text-[hsl(0,0%,10%)] text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {activeAnnotation + 1}
                </span>
                <p className="text-white text-xs leading-relaxed flex-1">
                  {item.annotations[activeAnnotation].label}
                </p>
                <button onClick={() => setActiveAnnotation(null)} className="text-white/60 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Title */}
      <div className="p-4 border-t border-[hsl(45,60%,40%,0.2)]">
        <h3 className="font-display font-semibold text-sm text-[hsl(45,60%,75%)]">{item.title}</h3>
        <p className="text-[hsl(0,0%,55%)] text-xs mt-1">Survolez pour découvrir les techniques</p>
      </div>
    </motion.div>
  );
}

export default function PlatingArt() {
  return (
    <div className="space-y-10 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Art du Dressage HaChef ✨</h1>
        <p className="text-muted-foreground text-sm">
          Maîtrisez les techniques de dressage pour sublimer chaque assiette comme un chef étoilé.
        </p>
      </motion.div>

      {/* Gallery by category */}
      {categories.map((cat, ci) => (
        <motion.section
          key={cat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ci * 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{cat.emoji}</span>
            <h2 className="font-display font-bold text-lg">{cat.name}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 rounded-2xl bg-[hsl(0,0%,10%)] p-5 border border-[hsl(45,60%,40%,0.15)]">
            {cat.items.map((item) => (
              <PlatingCard key={item.id} item={item} />
            ))}
          </div>
        </motion.section>
      ))}

      {/* Les 5 Règles d'Or */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-[hsl(0,0%,10%)] border border-[hsl(45,60%,40%,0.25)] p-6 md:p-8"
      >
        <div className="text-center mb-6">
          <h2 className="font-display font-bold text-lg text-[hsl(45,60%,75%)]">
            🏆 Les 5 Règles d'Or du Dressage
          </h2>
          <p className="text-[hsl(0,0%,55%)] text-xs mt-1">Le Conseil HaChef</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {goldenRules.map((rule, i) => (
            <motion.div
              key={rule.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-[hsl(0,0%,14%)] border border-[hsl(45,60%,40%,0.15)] hover:border-[hsl(45,60%,40%,0.4)] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[hsl(45,70%,50%,0.12)] flex items-center justify-center mb-3">
                <rule.icon className="w-5 h-5 text-[hsl(45,70%,55%)]" />
              </div>
              <h3 className="font-display font-semibold text-sm text-[hsl(45,60%,75%)] mb-1">{rule.title}</h3>
              <p className="text-[hsl(0,0%,55%)] text-xs leading-relaxed">{rule.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
