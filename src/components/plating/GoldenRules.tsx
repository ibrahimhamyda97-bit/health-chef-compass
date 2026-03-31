import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Palette, Mountain, Wind, Leaf, ChevronDown } from "lucide-react";

const goldenRules = [
  {
    icon: Sparkles,
    title: "Propreté",
    desc: "Bords de l'assiette impeccables, essuyés au torchon humide.",
    detail: "La propreté est la base absolue du dressage professionnel. Après avoir dressé votre plat, prenez systématiquement un torchon propre et légèrement humide pour essuyer tout le tour de l'assiette. Vérifiez qu'aucune goutte de sauce, trace de doigt ou miette ne vient gâcher la présentation. Les chefs étoilés inspectent chaque assiette avant qu'elle ne quitte la cuisine. Un bord propre encadre votre création comme un cadre encadre un tableau.",
  },
  {
    icon: Palette,
    title: "Harmonie des couleurs",
    desc: "3 couleurs max pour un visuel équilibré et appétissant.",
    detail: "Limitez-vous à 3 couleurs dominantes par assiette pour créer un visuel cohérent et appétissant. Pensez en termes de couleurs complémentaires : le vert des herbes contre le rouge des tomates, le blanc d'une crème contre le jaune du safran. Utilisez des ingrédients naturellement colorés — betterave pour le rose, curcuma pour le jaune, encre de seiche pour le noir. Évitez les colorants artificiels qui paraissent faux. L'assiette elle-même compte : une assiette blanche met en valeur toutes les couleurs, tandis qu'une assiette noire crée du contraste dramatique.",
  },
  {
    icon: Mountain,
    title: "Volume et hauteur",
    desc: "Jouer sur les niveaux pour créer de la profondeur.",
    detail: "Le volume transforme un plat plat en une création tridimensionnelle qui attire le regard. Empilez vos éléments en commençant par la base la plus large et stable, puis montez progressivement vers des éléments plus légers et aériens. Utilisez des cercles de présentation, des emporte-pièces ou même simplement vos mains pour donner de la hauteur. Un lit de purée, surmonté d'une protéine, couronnée d'herbes fraîches crée naturellement 3 niveaux. La règle : la hauteur ne doit jamais compromettre la stabilité — votre plat doit pouvoir être porté sans s'écrouler.",
  },
  {
    icon: Wind,
    title: "Espacement",
    desc: "Laisser respirer chaque élément — le vide est un allié.",
    detail: "Le vide est votre meilleur allié en dressage. Résistez à la tentation de remplir toute l'assiette — c'est l'erreur la plus courante. Chaque élément doit avoir son propre espace pour être visible et identifiable. Utilisez la règle du tiers : ne remplissez qu'un tiers à la moitié de la surface de l'assiette. Le blanc de l'assiette crée un cadre naturel qui met en valeur votre création. Pensez comme un photographe : le négatif (l'espace vide) est aussi important que le sujet principal. Un plat aéré paraît plus raffiné et plus appétissant qu'un plat surchargé.",
  },
  {
    icon: Leaf,
    title: "La touche finale",
    desc: "Herbes fraîches, épices colorées ou feuille d'or.",
    detail: "La touche finale est ce petit détail qui transforme un bon dressage en dressage exceptionnel. Ajoutez-la toujours en dernier, juste avant le service. Les options classiques : micro-pousses pour la fraîcheur, fleurs comestibles pour la couleur, un filet d'huile aromatisée pour la brillance, des copeaux de parmesan pour la texture, un tour de moulin à poivre pour les points noirs élégants, ou quelques cristaux de fleur de sel pour le croquant. Pour les occasions spéciales, pensez à la feuille d'or alimentaire ou aux poudres shimmer comestibles. La clé : moins c'est plus — une seule touche bien placée vaut mieux que dix garnitures qui se battent pour l'attention.",
  },
];

export default function GoldenRules() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl bg-[hsl(0,0%,10%)] border border-[hsl(45,60%,40%,0.25)] p-6 md:p-8"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-center mb-2"
      >
        <h2 className="font-display font-bold text-lg text-[hsl(45,60%,75%)] inline-flex items-center gap-2">
          🏆 Les 5 Règles d'Or du Dressage
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </h2>
        <p className="text-[hsl(0,0%,55%)] text-xs mt-1">Le Conseil HaChef — Cliquez pour découvrir</p>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
              {goldenRules.map((rule, i) => (
                <motion.div
                  key={rule.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 + i * 0.08 }}
                  className="flex flex-col items-center text-center p-4 rounded-xl bg-[hsl(0,0%,14%)] border border-[hsl(45,60%,40%,0.15)] hover:border-[hsl(45,60%,40%,0.4)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[hsl(45,70%,50%,0.12)] flex items-center justify-center mb-3">
                    <rule.icon className="w-5 h-5 text-[hsl(45,70%,55%)]" />
                  </div>
                  <h3 className="font-display font-semibold text-sm text-[hsl(45,60%,75%)] mb-1">{rule.title}</h3>
                  <p className="text-[hsl(0,0%,55%)] text-xs leading-relaxed mb-2">{rule.desc}</p>
                  <p className="text-[hsl(0,0%,50%)] text-[10px] leading-relaxed mt-auto">{rule.detail}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
