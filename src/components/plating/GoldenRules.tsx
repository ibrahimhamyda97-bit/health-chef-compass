import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Palette,
  Mountain,
  Wind,
  Leaf,
  ChevronDown,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";

interface QuizOption {
  text: string;
  correct: boolean;
}

interface Section {
  label: string;
  body: string;
  highlights?: string[];
}

interface Rule {
  num: number;
  icon: any;
  title: string;
  subtitle: string;
  sections: Section[];
  quiz: {
    question: string;
    options: QuizOption[];
  };
}

const rules: Rule[] = [
  {
    num: 1,
    icon: Sparkles,
    title: "Propreté",
    subtitle: "La Base Absolue",
    sections: [
      {
        label: "Fondamentale",
        body:
          "L'assiette est votre toile. La propreté est la base absolue du dressage professionnel. Après avoir dressé votre plat, prenez systématiquement un torchon propre et légèrement humide pour essuyer tout le tour de l'assiette.",
      },
      {
        label: "Action",
        body:
          "Utilisez un torchon propre et humide. Vérifiez qu'aucune goutte de sauce, trace de doigt ou miette ne vient gâcher la présentation. Les chefs étoilés inspectent chaque assiette avant qu'elle ne quitte la cuisine.",
      },
      {
        label: "Point clé",
        body:
          "Aucune trace de doigt ou de sauce tolérée sur les bords. Un bord propre encadre votre création comme un cadre encadre un tableau.",
      },
    ],
    quiz: {
      question: "Quel outil utilise-t-on pour nettoyer les bords de l'assiette ?",
      options: [
        { text: "Une serviette en papier sèche", correct: false },
        { text: "Un torchon propre et légèrement humide", correct: true },
        { text: "Le doigt", correct: false },
      ],
    },
  },
  {
    num: 2,
    icon: Palette,
    title: "Harmonie des Couleurs",
    subtitle: "L'équilibre visuel",
    sections: [
      {
        label: "Règle d'or",
        body:
          "Limitez à 3 couleurs dominantes par assiette pour un visuel équilibré et appétissant. Pensez en termes de couleurs complémentaires : le vert des herbes contre le rouge des tomates, le blanc d'une crème contre le jaune du safran.",
      },
      {
        label: "Contrastes",
        body:
          "Jouez sur les oppositions naturelles. Utilisez des ingrédients naturellement colorés : betterave pour le rose, curcuma pour le jaune, encre de seiche pour le noir.",
      },
      {
        label: "Astuce",
        body:
          "Privilégiez les ingrédients naturellement colorés. Évitez les colorants artificiels qui paraissent faux. L'assiette elle-même compte : une assiette blanche met en valeur toutes les couleurs.",
      },
    ],
    quiz: {
      question: "Combien de couleurs dominantes maximum par assiette ?",
      options: [
        { text: "5 couleurs", correct: false },
        { text: "3 couleurs", correct: true },
        { text: "Autant que possible", correct: false },
      ],
    },
  },
  {
    num: 3,
    icon: Mountain,
    title: "Volume et Hauteur",
    subtitle: "Créer du relief",
    sections: [
      {
        label: "Objectif",
        body:
          "Créer de la profondeur et du relief. Le volume transforme un plat plat en une création tridimensionnelle qui attire le regard.",
      },
      {
        label: "Méthode",
        body:
          "Empilez les éléments stratégiquement. Commencez par la base la plus large et stable, puis montez progressivement vers des éléments plus légers et aériens. Utilisez des cercles de présentation ou des emporte-pièces.",
      },
      {
        label: "Point de focus",
        body:
          "Utilisez un élément léger pour couronner le plat. Un lit de purée, surmonté d'une protéine, couronnée d'herbes fraîches crée naturellement 3 niveaux. La hauteur ne doit jamais compromettre la stabilité.",
      },
    ],
    quiz: {
      question: "Par quel élément doit-on commencer un dressage en hauteur ?",
      options: [
        { text: "L'élément le plus léger en bas", correct: false },
        { text: "La base la plus large et stable", correct: true },
        { text: "Les herbes fraîches", correct: false },
      ],
    },
  },
  {
    num: 4,
    icon: Wind,
    title: "Espacement",
    subtitle: "Le Negative Space",
    sections: [
      {
        label: "Concept",
        body:
          "Le vide est votre meilleur allié en dressage. Résistez à la tentation de remplir toute l'assiette — c'est l'erreur la plus courante. Chaque élément doit avoir son propre espace pour être visible.",
      },
      {
        label: "Règle des tiers",
        body:
          "Ne remplissez qu'un tiers ou la moitié de l'assiette. Utilisez le blanc de l'assiette comme un cadre naturel qui met en valeur votre création.",
      },
      {
        label: "Résultat",
        body:
          "Un plat aéré paraît instantanément plus raffiné. L'espace vide est aussi important que le sujet principal. Un plat serré paraît étouffant, un plat espacé paraît luxueux.",
      },
    ],
    quiz: {
      question: "Quelle proportion de l'assiette faut-il remplir ?",
      options: [
        { text: "Toute la surface", correct: false },
        { text: "Un tiers à la moitié", correct: true },
        { text: "Trois quarts", correct: false },
      ],
    },
  },
  {
    num: 5,
    icon: Leaf,
    title: "La Touche Finale",
    subtitle: "L'art du détail",
    sections: [
      {
        label: "Détail",
        body:
          "C'est ce qui transforme un plat en œuvre. La touche finale est ce petit détail qui transforme un bon dressage en dressage exceptionnel. Ajoutez-la toujours en dernier, juste avant le service.",
      },
      {
        label: "Options",
        body:
          "Herbes fraîches, épices, fleurs comestibles ou feuille de sel. Micro-pousses pour la fraîcheur, fleurs pour la couleur, un filet d'huile aromatisée pour la brillance, ou quelques cristaux de fleur de sel pour le croquant.",
      },
      {
        label: "Principe",
        body:
          "« Less is more » — une touche précise vaut mieux que dix. La clé : moins c'est plus. Une seule touche bien placée vaut mieux que dix garnitures qui se battent pour l'attention.",
      },
    ],
    quiz: {
      question: "Quand doit-on ajouter la touche finale ?",
      options: [
        { text: "Au début du dressage", correct: false },
        { text: "Toujours en dernier, juste avant le service", correct: true },
        { text: "À mi-parcours", correct: false },
      ],
    },
  },
];

function QuizModule({ rule }: { rule: Rule }) {
  const [selected, setSelected] = useState<number | null>(null);
  const isAnswered = selected !== null;
  const isCorrect = isAnswered && rule.quiz.options[selected].correct;

  return (
    <div className="mt-4 pt-4 border-t border-[hsl(45,60%,40%,0.2)]">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-[hsl(45,70%,55%)] mb-2">
        ✦ Quiz éclair
      </p>
      <p className="text-[13px] text-[hsl(0,0%,93%)] mb-3 leading-relaxed">{rule.quiz.question}</p>
      <div className="space-y-2">
        {rule.quiz.options.map((opt, i) => {
          const isSel = selected === i;
          let cls =
            "w-full text-left text-xs px-3 py-2 rounded-lg border transition-all leading-relaxed";
          if (!isAnswered) {
            cls += " border-[hsl(45,60%,40%,0.25)] bg-[hsl(0,0%,8%)] text-[hsl(0,0%,85%)] hover:border-[hsl(45,70%,55%)] hover:bg-[hsl(0,0%,12%)]";
          } else if (opt.correct) {
            cls += " border-emerald-500/60 bg-emerald-500/10 text-emerald-300";
          } else if (isSel) {
            cls += " border-rose-500/60 bg-rose-500/10 text-rose-300";
          } else {
            cls += " border-[hsl(45,60%,40%,0.15)] bg-[hsl(0,0%,8%)] text-[hsl(0,0%,50%)]";
          }
          return (
            <button
              key={i}
              onClick={() => !isAnswered && setSelected(i)}
              disabled={isAnswered}
              className={cls}
            >
              <span className="flex items-center gap-2">
                {isAnswered && opt.correct && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                {isAnswered && isSel && !opt.correct && <XCircle className="w-3.5 h-3.5 shrink-0" />}
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center justify-between gap-2"
          >
            <p
              className={`text-xs font-medium ${
                isCorrect ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isCorrect
                ? "✓ Excellent ! Bonne réponse."
                : "✗ Pas tout à fait — relisez la section."}
            </p>
            <button
              onClick={() => setSelected(null)}
              className="text-[10px] text-[hsl(45,70%,55%)] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Recommencer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GoldenRules() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl bg-gradient-to-b from-[hsl(0,0%,8%)] to-[hsl(0,0%,11%)] border border-[hsl(45,60%,40%,0.25)] p-6 md:p-8"
    >
      <button onClick={() => setIsOpen(!isOpen)} className="w-full text-center mb-2">
        <h2 className="font-display font-bold text-xl md:text-2xl text-[hsl(45,60%,75%)] inline-flex items-center gap-2">
          🏆 Les 5 Règles d'Or du Dressage
          <ChevronDown
            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </h2>
        <p className="text-[hsl(0,0%,60%)] text-xs mt-1">
          Le Cours Magistral HaChef — Cliquez pour découvrir
        </p>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mt-6">
              {rules.map((rule, i) => (
                <motion.article
                  key={rule.num}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.07 }}
                  className="flex flex-col p-5 rounded-2xl bg-[hsl(0,0%,14%)] border border-[hsl(45,60%,40%,0.2)] hover:border-[hsl(45,60%,40%,0.5)] transition-colors"
                  style={{ lineHeight: 1.6 }}
                >
                  {/* Header */}
                  <header className="mb-4 pb-4 border-b border-[hsl(45,60%,40%,0.2)]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(45,70%,50%,0.2)] to-[hsl(45,70%,40%,0.05)] flex items-center justify-center border border-[hsl(45,60%,40%,0.3)]">
                        <rule.icon className="w-5 h-5 text-[hsl(45,70%,55%)]" />
                      </div>
                      <span className="text-[10px] uppercase tracking-widest font-semibold text-[hsl(45,70%,55%)]">
                        Règle {rule.num}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-base text-[hsl(45,60%,75%)]">
                      {rule.title}
                    </h3>
                    <p className="text-xs text-[hsl(0,0%,55%)] italic mt-0.5">
                      {rule.subtitle}
                    </p>
                  </header>

                  {/* Sections */}
                  <div className="space-y-3 flex-1">
                    {rule.sections.map((section, si) => (
                      <div key={si}>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(45,70%,55%)] mb-1">
                          {section.label}
                        </p>
                        <p
                          className="text-[13px] text-[hsl(0,0%,93%)]"
                          style={{ lineHeight: 1.6, color: "#F8F9FA" }}
                        >
                          {section.body}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Quiz */}
                  <QuizModule rule={rule} />
                </motion.article>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
