import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, ChevronDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PhotoCapture from "./PhotoCapture";

import techniqueVirgule from "@/assets/technique-virgule.jpg";
import techniqueHauteur from "@/assets/technique-hauteur.jpg";
import techniqueCirculaire from "@/assets/technique-circulaire.jpg";
import techniqueQuenelle from "@/assets/technique-quenelle.jpg";

interface Course {
  id: string;
  title: string;
  image: string;
  description: string;
  steps: string[];
}

const courses: Course[] = [
  {
    id: "virgule",
    title: "Maîtriser la Virgule de Sauce",
    image: techniqueVirgule,
    description:
      "La virgule de sauce est le geste signature des chefs étoilés. Elle apporte du mouvement et de l'élégance à chaque assiette en créant une courbe fluide et précise.",
    steps: [
      "Déposez une cuillère à soupe de sauce au centre-bas de l'assiette.",
      "Utilisez le dos d'une cuillère ou une spatule coudée.",
      "Appuyez fermement, puis tirez en un geste rapide et continu vers le haut.",
      "Relâchez la pression progressivement pour obtenir un trait effilé.",
      "Essuyez les bords de l'assiette au torchon humide.",
    ],
  },
  {
    id: "hauteur",
    title: "L'Art de la Hauteur",
    image: techniqueHauteur,
    description:
      "Jouer sur la verticalité transforme un plat plat en une création sculpturale. L'empilement doit rester stable et appétissant.",
    steps: [
      "Commencez par la base la plus large et stable (purée, lit de légumes).",
      "Utilisez un emporte-pièce ou un cercle de présentation pour guider.",
      "Empilez les éléments du plus dense au plus léger.",
      "Ajoutez un élément vertical au sommet (herbe, tuile, chip).",
      "Retirez le moule délicatement en tournant légèrement.",
    ],
  },
  {
    id: "circulaire",
    title: "Le Dressage Circulaire",
    image: techniqueCirculaire,
    description:
      "La disposition en cercle crée une harmonie visuelle parfaite. Chaque élément est placé à distance égale pour un effet mandala raffiné.",
    steps: [
      "Identifiez le centre de l'assiette comme point de référence.",
      "Disposez les éléments principaux en cercle à distance égale.",
      "Alternez les couleurs et les textures pour le rythme visuel.",
      "Ajoutez les micro-pousses entre chaque élément.",
      "Terminez par un point central (sauce ou condiment).",
    ],
  },
  {
    id: "quenelle",
    title: "La Quenelle Parfaite",
    image: techniqueQuenelle,
    description:
      "La quenelle est une forme ovale lisse obtenue à l'aide de deux cuillères. Elle exige de la pratique mais donne un résultat élégant.",
    steps: [
      "Plongez deux cuillères à soupe dans l'eau chaude.",
      "Prélevez une bonne quantité de préparation avec la première cuillère.",
      "Façonnez en passant la préparation d'une cuillère à l'autre 3 à 4 fois.",
      "Déposez la quenelle sur l'assiette d'un geste fluide.",
      "Nettoyez les cuillères entre chaque quenelle.",
    ],
  },
];

const STORAGE_KEY = "hamenu-learned-techniques";

function getLearnedTechniques(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function TechniqueCourses() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [learned, setLearned] = useState<string[]>(getLearnedTechniques);
  const [zoomedImage, setZoomedImage] = useState<{ src: string; alt: string } | null>(null);

  const toggleLearned = (id: string) => {
    const next = learned.includes(id)
      ? learned.filter((l) => l !== id)
      : [...learned, id];
    setLearned(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center gap-2 mb-5">
        <GraduationCap className="w-5 h-5 text-[hsl(45,70%,55%)]" />
        <h2 className="font-display font-bold text-lg">Les Cours de Techniques</h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {learned.length}/{courses.length} maîtrisées
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courses.map((course, i) => {
          const isExpanded = expandedId === course.id;
          const isLearned = learned.includes(course.id);

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl overflow-hidden border border-[hsl(45,60%,40%,0.25)] bg-[hsl(0,0%,12%)]"
            >
              {/* Image */}
              <div
                className="relative h-44 overflow-hidden cursor-zoom-in"
                onClick={() => setZoomedImage({ src: course.image, alt: course.title })}
              >
                <img
                  src={course.image}
                  alt={course.title}
                  loading="lazy"
                  width={640}
                  height={640}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
                {isLearned && (
                  <div className="absolute top-3 right-3 bg-[hsl(45,70%,50%)] text-[hsl(0,0%,10%)] text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Maîtrisé
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <h3 className="font-display font-semibold text-sm text-[hsl(45,60%,75%)]">
                  {course.title}
                </h3>
                <p className="text-[hsl(0,0%,60%)] text-xs leading-relaxed">
                  {course.description}
                </p>

                {/* Toggle steps */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : course.id)}
                  className="flex items-center gap-1 text-[hsl(45,70%,55%)] text-xs font-medium hover:underline"
                >
                  Voir les étapes
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.ol
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {course.steps.map((step, si) => (
                        <li
                          key={si}
                          className="flex gap-2 text-xs text-[hsl(0,0%,65%)] leading-relaxed"
                        >
                          <span className="shrink-0 w-5 h-5 rounded-full bg-[hsl(45,70%,50%,0.15)] text-[hsl(45,70%,55%)] flex items-center justify-center text-[10px] font-bold mt-0.5">
                            {si + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </motion.ol>
                  )}
                </AnimatePresence>

                <Button
                  size="sm"
                  onClick={() => toggleLearned(course.id)}
                  className={`w-full text-xs h-8 ${
                    isLearned
                      ? "bg-[hsl(45,70%,50%)] text-[hsl(0,0%,10%)] hover:bg-[hsl(45,70%,45%)]"
                      : "bg-[hsl(0,0%,18%)] text-[hsl(45,60%,75%)] border border-[hsl(45,60%,40%,0.3)] hover:bg-[hsl(0,0%,22%)]"
                  }`}
                >
                  {isLearned ? "✓ Technique maîtrisée" : "J'ai appris cette technique"}
                </Button>

                <PhotoCapture courseTitle={course.title} courseImage={course.image} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
