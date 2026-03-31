import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import platingEntree1 from "@/assets/plating-entree-1.jpg";
import platingEntree2 from "@/assets/plating-entree-2.jpg";
import platingPlat1 from "@/assets/plating-plat-1.jpg";
import platingPlat2 from "@/assets/plating-plat-2.jpg";
import platingDessert1 from "@/assets/plating-dessert-1.jpg";
import platingDessert2 from "@/assets/plating-dessert-2.jpg";

interface Annotation {
  x: number;
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

function PlatingCard({ item, onClickImage }: { item: PlatingItem; onClickImage: (img: string, title: string) => void }) {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-2xl overflow-hidden border border-[hsl(45,60%,40%,0.3)] bg-[hsl(0,0%,12%)]"
    >
      <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => onClickImage(item.image, item.title)}>
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          width={640}
          height={640}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

        {item.annotations.map((ann, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setActiveAnnotation(activeAnnotation === i ? null : i); }}
            style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
            className="absolute z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1/2 -translate-y-1/2"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(45,70%,50%)] text-[hsl(0,0%,10%)] text-[10px] font-bold shadow-lg ring-2 ring-[hsl(45,70%,50%,0.4)] animate-pulse hover:animate-none hover:scale-125 transition-transform cursor-pointer">
              {i + 1}
            </span>
          </button>
        ))}

        <AnimatePresence>
          {activeAnnotation !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-black/50 z-20"
              onClick={(e) => e.stopPropagation()}
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

      <div className="p-4 border-t border-[hsl(45,60%,40%,0.2)]">
        <h3 className="font-display font-semibold text-sm text-[hsl(45,60%,75%)]">{item.title}</h3>
        <p className="text-[hsl(0,0%,55%)] text-xs mt-1">Cliquez pour agrandir · Survolez pour les techniques</p>
      </div>
    </motion.div>
  );
}

export default function PlatingGallery() {
  const [lightbox, setLightbox] = useState<{ image: string; title: string } | null>(null);

  return (
    <>
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
              <PlatingCard key={item.id} item={item} onClickImage={(img, title) => setLightbox({ image: img, title })} />
            ))}
          </div>
        </motion.section>
      ))}

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-3xl p-0 bg-[hsl(0,0%,8%)] border-[hsl(45,60%,40%,0.3)] overflow-hidden">
          {lightbox && (
            <div className="relative">
              <img src={lightbox.image} alt={lightbox.title} className="w-full h-auto max-h-[80vh] object-contain" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="font-display font-semibold text-lg text-[hsl(45,60%,75%)]">{lightbox.title}</h3>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
