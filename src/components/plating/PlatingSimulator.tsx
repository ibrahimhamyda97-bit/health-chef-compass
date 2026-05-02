import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Lightbulb, RotateCcw, Sparkles } from "lucide-react";
import meatImg from "@/assets/plating/meat.png";
import pureeImg from "@/assets/plating/puree.png";
import greensImg from "@/assets/plating/greens.png";
import sauceImg from "@/assets/plating/sauce.png";
import plateImg from "@/assets/plating/plate.png";

const GOLD = "hsl(45, 65%, 52%)";
const OFF_WHITE = "#F8F9FA";

type ToolKind = "meat" | "puree" | "greens" | "sauce";

interface Tool {
  kind: ToolKind;
  label: string;
  hint: string;
  size: number;
  img: string;
}

const TOOLS: Tool[] = [
  { kind: "meat", label: "Pièce de viande", hint: "L'élément principal", size: 130, img: meatImg },
  { kind: "puree", label: "Quenelle de purée", hint: "La base crémeuse", size: 110, img: pureeImg },
  { kind: "sauce", label: "Trait de sauce", hint: "Le liant aromatique", size: 140, img: sauceImg },
  { kind: "greens", label: "Micro-pousses", hint: "La touche finale", size: 75, img: greensImg },
];

interface Placed {
  id: string;
  kind: ToolKind;
  x: number;
  y: number;
}

const PLATE_SIZE = 380;
const PLATE_RADIUS = PLATE_SIZE / 2;

export default function PlatingSimulator() {
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const plateRef = useRef<HTMLDivElement>(null);

  function addTool(kind: ToolKind) {
    setFeedback(null);
    setPlaced((prev) => [
      ...prev,
      { id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, kind, x: 0, y: 0 },
    ]);
  }

  function removeTool(id: string) {
    setPlaced((prev) => prev.filter((p) => p.id !== id));
  }

  function reset() {
    setPlaced([]);
    setFeedback(null);
  }

  function onPointerMove(e: React.PointerEvent, id: string) {
    if (draggingId !== id || !plateRef.current) return;
    const rect = plateRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setPlaced((prev) =>
      prev.map((p) => (p.id === id ? { ...p, x: e.clientX - cx, y: e.clientY - cy } : p))
    );
  }

  function check() {
    if (placed.length === 0) {
      setFeedback({ ok: false, msg: "Commence par ajouter au moins un élément !" });
      return;
    }
    const inside = placed.filter((p) => Math.hypot(p.x, p.y) <= PLATE_RADIUS - 30);
    if (inside.length < placed.length) {
      setFeedback({ ok: false, msg: "Certains éléments débordent de l'assiette — recadre-les vers le centre." });
      return;
    }
    const hasMeat = placed.some((p) => p.kind === "meat");
    const hasPuree = placed.some((p) => p.kind === "puree");
    const hasGreens = placed.some((p) => p.kind === "greens");
    if (!hasMeat || !hasPuree) {
      setFeedback({ ok: false, msg: "Compose un vrai dressage : pose au moins une base et une protéine." });
      return;
    }
    if (!hasGreens) {
      setFeedback({ ok: false, msg: "Il manque une touche finale — ajoute des micro-pousses !" });
      return;
    }
    const avgDist = placed.reduce((acc, p) => acc + Math.hypot(p.x, p.y), 0) / placed.length;
    const minOk = PLATE_RADIUS * 0.15;
    const maxOk = PLATE_RADIUS * 0.65;
    if (avgDist < minOk) {
      setFeedback({ ok: false, msg: "Tout est collé au centre. Pense à la règle des tiers pour aérer la composition." });
      return;
    }
    if (avgDist > maxOk) {
      setFeedback({ ok: false, msg: "Les éléments sont trop dispersés vers les bords — recentre légèrement." });
      return;
    }
    const meat = placed.find((p) => p.kind === "meat");
    const greens = placed.find((p) => p.kind === "greens");
    if (meat && greens && Math.hypot(meat.x - greens.x, meat.y - greens.y) > PLATE_RADIUS * 0.45) {
      setFeedback({ ok: false, msg: "Pense à donner de la hauteur ! Pose les micro-pousses sur la viande pour empiler." });
      return;
    }
    setFeedback({ ok: true, msg: "Bravo, l'équilibre est parfait !" });
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-3xl p-6 md:p-10"
      style={{
        background: "linear-gradient(180deg, #0d0d0d 0%, #161311 60%, #0d0d0d 100%)",
        border: "1px solid rgba(212, 175, 55, 0.25)",
        boxShadow: "0 30px 60px -30px rgba(212, 175, 55, 0.15)",
      }}
    >
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.2em] font-bold mb-3"
          style={{
            background: "rgba(212, 175, 55, 0.1)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            color: GOLD,
          }}
        >
          <Sparkles className="w-3 h-3" /> Atelier Pratique
        </div>
        <h2 className="font-display font-bold text-2xl md:text-3xl mb-2" style={{ color: GOLD }}>
          Simulateur de Dressage
        </h2>
        <p className="text-sm" style={{ color: "rgba(248, 249, 250, 0.6)" }}>
          Glisse les ingrédients sur l'assiette en céramique, superpose-les, puis valide ta composition.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_240px] gap-8 items-start">
        {/* Plate */}
        <div className="flex justify-center">
          <div
            ref={plateRef}
            className="relative shrink-0 select-none touch-none"
            style={{
              width: PLATE_SIZE,
              height: PLATE_SIZE,
              filter: "drop-shadow(0 40px 50px rgba(0,0,0,0.65)) drop-shadow(0 10px 20px rgba(0,0,0,0.4))",
            }}
          >
            {/* Realistic ceramic plate */}
            <img
              src={plateImg}
              alt=""
              draggable={false}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                objectFit: "contain",
                filter: "brightness(1.02) contrast(1.02)",
              }}
            />
            {/* Subtle highlight overlay for ceramic feel */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                inset: 30,
                background:
                  "radial-gradient(ellipse 60% 40% at 35% 25%, rgba(255,255,255,0.35) 0%, transparent 60%)",
                mixBlendMode: "screen",
              }}
            />

            {placed.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-xs italic text-neutral-500">Ajoute des ingrédients depuis la boîte à outils →</p>
              </div>
            )}

            {placed.map((p, idx) => {
              const tool = TOOLS.find((t) => t.kind === p.kind)!;
              const isDragging = draggingId === p.id;
              return (
                <motion.div
                  key={p.id}
                  onPointerDown={(e) => {
                    (e.target as HTMLElement).setPointerCapture(e.pointerId);
                    setDraggingId(p.id);
                  }}
                  onPointerMove={(e) => onPointerMove(e, p.id)}
                  onPointerUp={() => setDraggingId(null)}
                  onDoubleClick={() => removeTool(p.id)}
                  className="absolute cursor-grab active:cursor-grabbing"
                  style={{
                    width: tool.size,
                    height: tool.size,
                    left: `calc(50% + ${p.x}px - ${tool.size / 2}px)`,
                    top: `calc(50% + ${p.y}px - ${tool.size / 2}px)`,
                    zIndex: isDragging ? 50 : 10 + idx,
                    filter: isDragging
                      ? "drop-shadow(0 18px 22px rgba(0,0,0,0.55)) drop-shadow(0 6px 8px rgba(0,0,0,0.35))"
                      : "drop-shadow(0 8px 10px rgba(0,0,0,0.45)) drop-shadow(0 3px 4px rgba(0,0,0,0.25))",
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isDragging ? 1.12 : 1,
                    opacity: 1,
                    rotate: isDragging ? -2 : 0,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 22 }}
                  whileHover={{ scale: isDragging ? 1.12 : 1.05 }}
                  title={`${tool.label} — double-clic pour retirer`}
                >
                  <img
                    src={tool.img}
                    alt={tool.label}
                    draggable={false}
                    className="w-full h-full pointer-events-none"
                    style={{ objectFit: "contain" }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Toolbox */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(212, 175, 55, 0.04)",
            border: "1px solid rgba(212, 175, 55, 0.2)",
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.18em] font-bold mb-3" style={{ color: GOLD }}>
            🧰 Boîte à outils
          </p>
          <div className="space-y-2">
            {TOOLS.map((t) => (
              <motion.button
                key={t.kind}
                onClick={() => addTool(t.kind)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(212,175,55,0.2)",
                  color: OFF_WHITE,
                }}
              >
                <span
                  className="w-12 h-12 flex items-center justify-center rounded-full shrink-0 overflow-hidden"
                  style={{
                    background: "radial-gradient(circle at 35% 30%, #fafafa 0%, #d8d8d8 80%)",
                    border: "1.5px solid rgba(255,255,255,0.25)",
                    filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.4))",
                  }}
                >
                  <img
                    src={t.img}
                    alt=""
                    className="w-10 h-10"
                    style={{ objectFit: "contain" }}
                    draggable={false}
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold truncate">{t.label}</span>
                  <span className="block text-[10px] opacity-60 truncate">{t.hint}</span>
                </span>
              </motion.button>
            ))}
          </div>
          <p className="text-[10px] mt-3 italic opacity-50" style={{ color: OFF_WHITE }}>
            Glisse les éléments. Double-clic pour retirer. Empile-les pour donner de la hauteur.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
        <button
          onClick={check}
          className="px-6 py-3 rounded-full font-semibold text-sm transition-all hover:scale-[1.03]"
          style={{
            background: `linear-gradient(135deg, ${GOLD}, hsl(45, 80%, 65%))`,
            color: "#1a1410",
            boxShadow: "0 10px 30px -10px rgba(212,175,55,0.5)",
          }}
        >
          ✓ Vérifier mon dressage
        </button>
        <button
          onClick={reset}
          className="px-4 py-3 rounded-full text-sm flex items-center gap-2 transition-all hover:bg-white/5"
          style={{ color: OFF_WHITE, border: "1px solid rgba(212,175,55,0.3)" }}
        >
          <RotateCcw className="w-4 h-4" /> Recommencer
        </button>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-6 max-w-xl mx-auto rounded-xl p-4 flex items-start gap-3"
            style={{
              background: feedback.ok ? "rgba(34,197,94,0.12)" : "rgba(212,175,55,0.08)",
              border: `1px solid ${feedback.ok ? "rgba(34,197,94,0.5)" : "rgba(212,175,55,0.4)"}`,
            }}
          >
            {feedback.ok ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <Lightbulb className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GOLD }} />
            )}
            <p
              className="text-sm font-medium leading-relaxed"
              style={{ color: feedback.ok ? "#86efac" : OFF_WHITE }}
            >
              {feedback.msg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
