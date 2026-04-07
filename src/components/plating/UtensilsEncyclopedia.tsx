import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grip, Circle, Pipette, FlaskConical, Paintbrush, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Utensil {
  icon: typeof Grip;
  name: string;
  purpose: string;
  tip: string;
}

const utensils: Utensil[] = [
  {
    icon: Grip,
    name: "Pince de précision",
    purpose: "Permet de placer micro-pousses, fleurs et petits éléments au millimètre près.",
    tip: "Utilisez une pince courbée pour les éléments délicats et une droite pour les plus lourds.",
  },
  {
    icon: Circle,
    name: "Emporte-pièce",
    purpose: "Donne une forme parfaite aux tartares, aux légumes et aux mousses.",
    tip: "Trempez-le dans l'eau chaude pour un démoulage parfait à chaque fois.",
  },
  {
    icon: Pipette,
    name: "Cuillère à sauce",
    purpose: "Crée des virgules, des points et des traînées de sauce élégantes.",
    tip: "Utilisez le dos de la cuillère pour les virgules, la pointe pour les points.",
  },
  {
    icon: FlaskConical,
    name: "Flacon verseur",
    purpose: "Permet des dosages précis de sauces, huiles et coulis.",
    tip: "Remplissez à moitié pour un meilleur contrôle du débit et de la pression.",
  },
  {
    icon: Paintbrush,
    name: "Pinceau culinaire",
    purpose: "Applique des glacis, des jus réduits et de l'huile aromatisée en touche artistique.",
    tip: "Un coup de pinceau rapide et confiant donne un trait plus net qu'un geste hésitant.",
  },
];

export default function UtensilsEncyclopedia() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="rounded-2xl border border-[hsl(45,60%,40%,0.3)] bg-gradient-to-br from-[hsl(0,0%,10%)] to-[hsl(0,0%,14%)] p-6 shadow-lg">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 w-full group"
        >
          <div className="w-10 h-10 rounded-xl bg-[hsl(45,70%,50%,0.15)] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[hsl(45,70%,55%)]" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="font-display font-bold text-lg text-[hsl(45,60%,80%)]">Encyclopédie des Ustensiles</h2>
            <p className="text-xs text-[hsl(0,0%,50%)]">{utensils.length} outils essentiels du chef</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-[hsl(45,60%,40%,0.4)] text-[hsl(45,70%,55%)] hover:bg-[hsl(45,70%,50%,0.15)] hover:text-[hsl(45,70%,65%)] gap-1"
          >
            {isOpen ? "Masquer" : "Découvrir"}
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
          </Button>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {utensils.map((u, i) => (
                  <motion.div
                    key={u.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 + i * 0.07 }}
                    className="rounded-2xl border border-[hsl(45,60%,40%,0.25)] bg-[hsl(0,0%,12%)] p-5 flex flex-col gap-3 hover:border-[hsl(45,60%,40%,0.5)] transition-colors group/card"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[hsl(45,70%,50%,0.12)] flex items-center justify-center group-hover/card:bg-[hsl(45,70%,50%,0.2)] transition-colors">
                      <u.icon className="w-5 h-5 text-[hsl(45,70%,55%)]" />
                    </div>
                    <h3 className="font-display font-semibold text-sm text-[hsl(45,60%,75%)]">{u.name}</h3>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[hsl(0,0%,45%)] mb-1">À quoi ça sert ?</p>
                      <p className="text-xs text-[hsl(0,0%,65%)] leading-relaxed">{u.purpose}</p>
                    </div>
                    <div className="mt-auto pt-3 border-t border-[hsl(45,60%,40%,0.15)]">
                      <p className="text-[10px] uppercase tracking-wider text-[hsl(45,70%,55%)] mb-1 flex items-center gap-1">✨ L'astuce HaChef</p>
                      <p className="text-xs text-[hsl(0,0%,55%)] leading-relaxed italic">{u.tip}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
