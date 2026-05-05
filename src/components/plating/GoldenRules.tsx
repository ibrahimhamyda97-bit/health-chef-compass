import { useState, useEffect, useRef } from "react";
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
  Trophy,
  Mic,
  MicOff,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ruleCleanliness from "@/assets/rule-cleanliness.jpg";
import ruleColors from "@/assets/rule-colors.jpg";
import ruleVolume from "@/assets/rule-volume.jpg";
import ruleSpace from "@/assets/rule-space.jpg";
import ruleFinishing from "@/assets/rule-finishing.jpg";

interface QuizOption {
  text: string;
  correct: boolean;
}

interface Section {
  label: string;
  body: string;
}

interface Rule {
  num: number;
  icon: any;
  image: string;
  title: string;
  subtitle: string;
  sections: Section[];
  quiz: {
    question: string;
    options: QuizOption[];
  };
}

const GOLD = "hsl(45, 65%, 52%)"; // ~ #D4AF37
const OFF_WHITE = "#F8F9FA";

const rules: Rule[] = [
  {
    num: 1,
    icon: Sparkles,
    image: ruleCleanliness,
    title: "Propreté",
    subtitle: "La Base Absolue",
    sections: [
      {
        label: "Fondamentale",
        body:
          "L'assiette est votre toile, et la propreté en est la fondation. Aucun chef étoilé ne laisse partir une assiette tachée. C'est la première chose que perçoit le client, avant même de goûter. Une présentation impeccable installe une promesse silencieuse de maîtrise.",
      },
      {
        label: "Action",
        body:
          "Après chaque dressage, prenez un torchon propre et légèrement humide et essuyez systématiquement le tour de l'assiette. Inspectez sous différents angles : traces de sauce, miettes, projections, traces de doigts. Si nécessaire, utilisez un coton-tige pour les bords intérieurs délicats.",
      },
      {
        label: "Point clé",
        body:
          "Aucune trace tolérée sur les bords. Le rebord propre fonctionne comme un cadre qui met en valeur votre œuvre. Un dressage médiocre dans une assiette propre paraîtra toujours plus pro qu'un dressage parfait dans une assiette tachée.",
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
    image: ruleColors,
    title: "Harmonie des Couleurs",
    subtitle: "L'équilibre visuel",
    sections: [
      {
        label: "Règle d'or",
        body:
          "Limitez-vous à 3 couleurs dominantes maximum par assiette. Au-delà, l'œil se perd et l'appétit faiblit. Pensez en couleurs complémentaires : le vert d'une herbe contre le rouge d'une tomate confite, le blanc crémeux contre le jaune safran d'un jus.",
      },
      {
        label: "Contrastes",
        body:
          "Jouez les oppositions naturelles. La betterave offre un rose profond, le curcuma un jaune solaire, l'encre de seiche un noir dramatique, la spiruline un vert intense. Une touche sombre sur fond clair attire instantanément le regard vers le point focal.",
      },
      {
        label: "Astuce",
        body:
          "Privilégiez toujours des ingrédients naturellement colorés plutôt que des colorants artificiels qui sonnent faux à l'œil. Et n'oubliez pas : l'assiette elle-même est un acteur. Une porcelaine blanche mate met tout en valeur ; une ardoise crée du drame.",
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
    image: ruleVolume,
    title: "Volume et Hauteur",
    subtitle: "Créer du relief",
    sections: [
      {
        label: "Objectif",
        body:
          "Un plat plat est un plat triste. Le volume transforme une assiette en architecture comestible. Il crée une profondeur qui invite l'œil à voyager, à tourner autour, à découvrir le plat sous différents angles avant la première bouchée.",
      },
      {
        label: "Méthode",
        body:
          "Empilez stratégiquement : commencez par la base la plus large et la plus stable (purée, risotto, lit de légumes), puis montez vers des éléments plus légers et plus aériens. Utilisez des cercles de présentation ou des emporte-pièces pour des bases parfaitement nettes.",
      },
      {
        label: "Point de focus",
        body:
          "Couronnez toujours d'un élément léger : herbes, tuile croustillante, fleur. Visez 3 niveaux : base — protéine — couronnement. Mais attention : la hauteur ne doit jamais compromettre la stabilité. Un dressage qui s'effondre devant le client est une catastrophe.",
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
    image: ruleSpace,
    title: "Espacement",
    subtitle: "Le Negative Space",
    sections: [
      {
        label: "Concept",
        body:
          "Le vide n'est pas l'ennemi : c'est votre meilleur allié. L'erreur la plus commune en cuisine amateur est de vouloir remplir toute l'assiette. Or chaque élément a besoin de respirer pour être vu, compris, désiré. Le vide met en valeur le plein.",
      },
      {
        label: "Règle des tiers",
        body:
          "Ne couvrez jamais plus d'un tiers à la moitié de la surface utile. Le blanc de l'assiette devient un cadre naturel, comme une marge dans un livre. Cette retenue distingue immédiatement la cuisine de chef de la cuisine domestique.",
      },
      {
        label: "Résultat",
        body:
          "Un plat aéré paraît instantanément plus raffiné, plus précieux, plus cher. L'espace vide est aussi important que le sujet principal. Un plat serré paraît étouffant, un plat espacé paraît luxueux. Moins vous mettez, plus on remarque.",
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
    image: ruleFinishing,
    title: "La Touche Finale",
    subtitle: "L'art du détail",
    sections: [
      {
        label: "Détail",
        body:
          "C'est le détail qui transforme un bon plat en plat mémorable. La touche finale s'ajoute toujours en dernier, juste avant de servir, pour préserver sa fraîcheur, sa couleur et son éclat. C'est la signature du chef.",
      },
      {
        label: "Options",
        body:
          "Choisissez selon le plat : micro-pousses pour la fraîcheur végétale, fleurs comestibles pour la couleur, filet d'huile aromatisée pour la brillance, cristaux de fleur de sel pour le croquant, zestes pour l'aromatique. Chaque touche doit avoir un sens, gustatif autant que visuel.",
      },
      {
        label: "Principe",
        body:
          "« Less is more » — une touche précise vaut mieux que dix éparpillées. Une seule fleur bien placée dépasse dix garnitures qui se battent pour l'attention. La discipline est ici la plus haute forme d'élégance.",
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

function QuizModule({
  rule,
  onValidate,
}: {
  rule: Rule;
  onValidate: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const isAnswered = selected !== null;
  const isCorrect = isAnswered && rule.quiz.options[selected].correct;

  function handleSelect(i: number) {
    if (isAnswered) return;
    setSelected(i);
    if (rule.quiz.options[i].correct) onValidate();
  }

  return (
    <div
      className="mt-5 pt-5 rounded-xl p-4 border"
      style={{
        background: "rgba(212, 175, 55, 0.04)",
        borderColor: "rgba(212, 175, 55, 0.2)",
      }}
    >
      <p
        className="text-[11px] uppercase tracking-[0.18em] font-bold mb-2"
        style={{ color: GOLD }}
      >
        ✦ Micro-Quiz
      </p>
      <p
        className="text-[14px] mb-4 leading-relaxed font-medium"
        style={{ color: OFF_WHITE }}
      >
        {rule.quiz.question}
      </p>
      <div className="space-y-2">
        {rule.quiz.options.map((opt, i) => {
          const isSel = selected === i;
          let cls =
            "w-full text-left text-sm px-4 py-3 rounded-lg border transition-all leading-relaxed";
          let style: React.CSSProperties = {};
          if (!isAnswered) {
            cls += " hover:scale-[1.01]";
            style = {
              borderColor: "rgba(212, 175, 55, 0.25)",
              background: "rgba(0, 0, 0, 0.4)",
              color: OFF_WHITE,
            };
          } else if (opt.correct) {
            style = {
              borderColor: "rgba(34, 197, 94, 0.6)",
              background: "rgba(34, 197, 94, 0.12)",
              color: "#86efac",
            };
          } else if (isSel) {
            style = {
              borderColor: "rgba(244, 63, 94, 0.6)",
              background: "rgba(244, 63, 94, 0.12)",
              color: "#fda4af",
            };
          } else {
            style = {
              borderColor: "rgba(212, 175, 55, 0.1)",
              background: "rgba(0, 0, 0, 0.3)",
              color: "rgba(248, 249, 250, 0.4)",
            };
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={isAnswered}
              className={cls}
              style={style}
            >
              <span className="flex items-center gap-2">
                {isAnswered && opt.correct && (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                {isAnswered && isSel && !opt.correct && (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
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
            className="mt-4 flex items-center justify-between gap-2"
          >
            <p
              className={`text-sm font-semibold ${
                isCorrect ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isCorrect
                ? "✓ Parfait ! Règle assimilée."
                : "✗ Pas tout à fait — relisez la section."}
            </p>
            <button
              onClick={() => setSelected(null)}
              className="text-xs flex items-center gap-1 hover:underline"
              style={{ color: GOLD }}
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
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [validated, setValidated] = useState<Set<number>>(new Set());
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const openIdxRef = useRef<number | null>(null);

  useEffect(() => {
    openIdxRef.current = openIdx;
  }, [openIdx]);

  const progress = (validated.size / rules.length) * 100;
  const allDone = validated.size === rules.length;

  function markValidated(num: number) {
    setValidated((prev) => {
      const next = new Set(prev);
      next.add(num);
      return next;
    });
  }

  function handleVoiceCommand(transcript: string) {
    const t = transcript.toLowerCase().trim();
    const current = openIdxRef.current;
    if (/\b(suivant|next|prochain)\b/.test(t)) {
      const nextIdx = current === null ? 0 : Math.min(current + 1, rules.length - 1);
      setOpenIdx(nextIdx);
    } else if (/\b(précédent|precedent|previous|retour)\b/.test(t)) {
      const prevIdx = current === null ? 0 : Math.max(current - 1, 0);
      setOpenIdx(prevIdx);
    } else if (/\b(fermer|close|stop)\b/.test(t)) {
      setOpenIdx(null);
    }
  }

  function toggleListening() {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({
        title: "Non disponible",
        description: "La reconnaissance vocale n'est pas supportée par ce navigateur.",
        variant: "destructive",
      });
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = "fr-FR";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const last = e.results[e.results.length - 1];
      if (last.isFinal) handleVoiceCommand(last[0].transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
    toast({
      title: "Écoute activée",
      description: "Dites « Suivant » ou « Précédent » pour naviguer.",
    });
  }

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-3xl p-6 md:p-10"
      style={{
        background:
          "linear-gradient(180deg, #0d0d0d 0%, #161311 60%, #0d0d0d 100%)",
        border: "1px solid rgba(212, 175, 55, 0.25)",
        boxShadow: "0 30px 60px -30px rgba(212, 175, 55, 0.15)",
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold mb-3"
          style={{
            background: "rgba(212, 175, 55, 0.1)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            color: GOLD,
          }}
        >
          🏆 Cours Magistral
        </div>
        <h2
          className="font-display font-bold text-2xl md:text-3xl mb-2"
          style={{ color: GOLD }}
        >
          Les 5 Règles d'Or du Dressage
        </h2>
        <p className="text-sm" style={{ color: "rgba(248, 249, 250, 0.6)" }}>
          Cliquez sur chaque règle pour ouvrir son cours et valider votre quiz.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[11px] uppercase tracking-wider font-semibold"
            style={{ color: GOLD }}
          >
            Progression
          </span>
          <span
            className="text-xs font-mono font-bold"
            style={{ color: OFF_WHITE }}
          >
            {validated.size} / {rules.length}
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(212, 175, 55, 0.1)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${GOLD}, hsl(45, 80%, 65%))`,
              boxShadow: "0 0 12px rgba(212, 175, 55, 0.5)",
            }}
          />
        </div>
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 mt-4 text-sm font-semibold"
              style={{ color: GOLD }}
            >
              <Trophy className="w-4 h-4" />
              Maître des règles d'or — Bravo !
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Accordions */}
      <div className="space-y-3 max-w-3xl mx-auto">
        {rules.map((rule, idx) => {
          const isOpen = openIdx === idx;
          const isValidated = validated.has(rule.num);
          return (
            <motion.div
              key={rule.num}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                background: isOpen
                  ? "linear-gradient(180deg, #1a1612 0%, #131110 100%)"
                  : "#121110",
                border: `1px solid ${
                  isOpen
                    ? "rgba(212, 175, 55, 0.5)"
                    : "rgba(212, 175, 55, 0.18)"
                }`,
                boxShadow: isOpen
                  ? "0 20px 40px -20px rgba(212, 175, 55, 0.25)"
                  : "none",
              }}
            >
              {/* Trigger */}
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center gap-4 p-4 md:p-5 text-left transition-colors hover:bg-white/[0.02]"
              >
                {/* 3D illustration thumbnail */}
                <div
                  className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden"
                  style={{
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  <img
                    src={rule.image}
                    alt={rule.title}
                    width={80}
                    height={80}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] uppercase tracking-[0.2em] font-bold"
                      style={{ color: GOLD }}
                    >
                      Règle {rule.num}
                    </span>
                    {isValidated && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "rgba(34, 197, 94, 0.15)",
                          color: "#86efac",
                        }}
                      >
                        <CheckCircle2 className="w-3 h-3" /> Validée
                      </span>
                    )}
                  </div>
                  <h3
                    className="font-display font-bold text-lg md:text-xl truncate"
                    style={{ color: OFF_WHITE }}
                  >
                    {rule.title}
                  </h3>
                  <p
                    className="text-xs italic"
                    style={{ color: "rgba(248, 249, 250, 0.55)" }}
                  >
                    {rule.subtitle}
                  </p>
                </div>

                {/* Icon + chevron */}
                <div className="flex items-center gap-3 shrink-0">
                  <rule.icon
                    className="w-5 h-5 hidden sm:block"
                    style={{ color: GOLD }}
                  />
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <ChevronDown
                      className="w-5 h-5"
                      style={{ color: GOLD }}
                    />
                  </motion.div>
                </div>
              </button>

              {/* Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 md:px-6 pb-6 pt-2">
                      <div
                        className="h-px w-full mb-6"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)",
                        }}
                      />

                      {/* Hero illustration inside */}
                      <div
                        className="rounded-2xl overflow-hidden mb-6 relative"
                        style={{
                          border: "1px solid rgba(212, 175, 55, 0.2)",
                        }}
                      >
                        <img
                          src={rule.image}
                          alt={rule.title}
                          width={512}
                          height={256}
                          loading="lazy"
                          className="w-full h-44 md:h-56 object-cover"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(180deg, transparent 50%, rgba(13,13,13,0.85) 100%)",
                          }}
                        />
                        <div className="absolute bottom-3 left-4">
                          <p
                            className="text-[10px] uppercase tracking-[0.2em] font-bold"
                            style={{ color: GOLD }}
                          >
                            Illustration
                          </p>
                          <p
                            className="text-sm font-display"
                            style={{ color: OFF_WHITE }}
                          >
                            {rule.title} — {rule.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Sections */}
                      <div className="space-y-5">
                        {rule.sections.map((section, si) => (
                          <div
                            key={si}
                            className="pl-4 border-l-2"
                            style={{
                              borderColor: "rgba(212, 175, 55, 0.4)",
                            }}
                          >
                            <p
                              className="text-[12px] uppercase tracking-[0.16em] font-extrabold mb-2"
                              style={{ color: GOLD }}
                            >
                              {section.label}
                            </p>
                            <p
                              className="text-[15px] leading-[1.7]"
                              style={{ color: OFF_WHITE }}
                            >
                              {section.body}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Quiz */}
                      <QuizModule
                        rule={rule}
                        onValidate={() => markValidated(rule.num)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
