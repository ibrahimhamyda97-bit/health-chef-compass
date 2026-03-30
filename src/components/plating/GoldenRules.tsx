import { motion } from "framer-motion";
import { Sparkles, Palette, Mountain, Wind, Leaf } from "lucide-react";

const goldenRules = [
  { icon: Sparkles, title: "Propreté", desc: "Bords de l'assiette impeccables, essuyés au torchon humide." },
  { icon: Palette, title: "Harmonie des couleurs", desc: "3 couleurs max pour un visuel équilibré et appétissant." },
  { icon: Mountain, title: "Volume et hauteur", desc: "Jouer sur les niveaux pour créer de la profondeur." },
  { icon: Wind, title: "Espacement", desc: "Laisser respirer chaque élément — le vide est un allié." },
  { icon: Leaf, title: "La touche finale", desc: "Herbes fraîches, épices colorées ou feuille d'or." },
];

export default function GoldenRules() {
  return (
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
  );
}
