import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Lightbulb, RotateCcw, Sparkles } from "lucide-react";

const GOLD = "hsl(45, 65%, 52%)";
const OFF_WHITE = "#F8F9FA";

type ToolKind = "meat" | "puree" | "greens" | "sauce";

interface Tool {
  kind: ToolKind;
  label: string;
  emoji: string;
  hint: string;
  size: number; // px
  color: string;
}

const TOOLS: Tool[] = [
  { kind: "meat", label: "Pièce de viande", emoji: "🥩", hint: "L'élément principal", size: 90, color: "#8b3a2a" },
  { kind: "puree", label: "Quenelle de purée", emoji: "🥔", hint: "La base crémeuse", size: 70, color: "#f1d9a0" },
  { kind: "greens", label: "Micro-pousses", emoji: "🌿", hint: "La touche finale", size: 50, color: "#4ade80" },
  { kind: "sauce", label: "Trait de sauce", emoji: "🥄", hint: "Le liant aromatique", size: 80, color: "#7c2d12" },
];

interface Placed {
  id: string;
  kind: ToolKind;
  // relative to plate center (0..1 from -1 to 1, with radius = 1)
  x: number; // px from center
  y: number;
}

const PLATE_SIZE = 360; // px
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
      {
        id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        kind,
        x: 0,
        y: 0,
      },
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
    const inside = placed.filter((p) => {
      const d = Math.hypot(p.x, p.y);
      return d <= PLATE_RADIUS - 20;
    });
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

    // Distance moyenne au centre — règle des tiers : ni au centre exact, ni au bord
    const avgDist =
      placed.reduce((acc, p) => acc + Math.hypot(p.x, p.y), 0) / placed.length;
    const minOk = PLATE_RADIUS * 0.15;
    const maxOk = PLATE_RADIUS * 0.7;

    if (avgDist < minOk) {
      setFeedback({
        ok: false,
        msg: "Tout est collé au centre. Pense à la règle des tiers pour aérer la composition.",
      });
      return;
    }
    if (avgDist > maxOk) {
      setFeedback({
        ok: false,
        msg: "Les éléments sont trop dispersés vers les bords — recentre légèrement.",
      });
      return;
    }

    // Check vertical layering hint (we use vertical y position as proxy for height)
    const meat = placed.find((p) => p.kind === "meat");
    const greens = placed.find((p) => p.kind === "greens");
    if (meat && greens && Math.hypot(meat.x - greens.x, meat.y - greens.y) > PLATE_RADIUS * 0.6) {
      setFeedback({
        ok: false,
        msg: "Pense à donner de la hauteur ! Pose les micro-pousses sur la viande pour empiler.",
      });
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
          <Sparkles className="w-3 h-3" /> Atelier Pratique
        </div>
        <h2 className="font-display font-bold text-2xl md:text-3xl mb-2" style={{ color: GOLD }}>
          Simulateur de Dressage
        </h2>
        <p className="text-sm" style={{ color: "rgba(248, 249, 250, 0.6)" }}>
          Glisse les éléments sur l'assiette, puis valide ta composition.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_220px] gap-8 items-start">
        {/* Plate */}
        <div className="flex justify-center">
          <div
            ref={plateRef}
            className="relative rounded-full shrink-0 select-none touch-none"
            style={{
              width: PLATE_SIZE,
              height: PLATE_SIZE,
              background:
                "radial-gradient(circle at 35% 30%, #fefefe 0%, #e8e8e8 70%, #c9c9c9 100%)",
              boxShadow:
                "inset 0 0 40px rgba(0,0,0,0.15), 0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 8px rgba(255,255,255,0.05)",
            }}
          >
            {/* Inner ring */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                inset: 18,
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            />

            {placed.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-xs italic text-neutral-500">Ajoute des éléments depuis la boîte à outils →</p>
              </div>
            )}

            {placed.map((p) => {
              const tool = TOOLS.find((t) => t.kind === p.kind)!;
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
                  className="absolute cursor-grab active:cursor-grabbing flex items-center justify-center rounded-full shadow-lg"
                  style={{
                    width: tool.size,
                    height: tool.size,
                    left: `calc(50% + ${p.x}px - ${tool.size / 2}px)`,
                    top: `calc(50% + ${p.y}px - ${tool.size / 2}px)`,
                    background: `radial-gradient(circle at 35% 30%, ${tool.color}ee, ${tool.color}aa)`,
                    border: "2px solid rgba(255,255,255,0.4)",
                    fontSize: tool.size * 0.45,
                    zIndex: draggingId === p.id ? 10 : 1,
                  }}
                  whileHover={{ scale: 1.05 }}
                  title={`${tool.label} — double-clic pour retirer`}
                >
                  <span className="pointer-events-none">{tool.emoji}</span>
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
          <p
            className="text-[11px] uppercase tracking-[0.18em] font-bold mb-3"
            style={{ color: GOLD }}
          >
            🧰 Boîte à outils
          </p>
          <div className="space-y-2">
            {TOOLS.map((t) => (
              <button
                key={t.kind}
                onClick={() => addTool(t.kind)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all hover:scale-[1.02] text-left"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(212,175,55,0.2)",
                  color: OFF_WHITE,
                }}
              >
                <span
                  className="w-10 h-10 flex items-center justify-center rounded-full text-xl shrink-0"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, ${t.color}ee, ${t.color}aa)`,
                    border: "1.5px solid rgba(255,255,255,0.3)",
                  }}
                >
                  {t.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold truncate">{t.label}</span>
                  <span className="block text-[10px] opacity-60 truncate">{t.hint}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] mt-3 italic opacity-50" style={{ color: OFF_WHITE }}>
            Glisse les éléments. Double-clic pour retirer.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 mt-8">
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
          style={{
            color: OFF_WHITE,
            border: "1px solid rgba(212,175,55,0.3)",
          }}
        >
          <RotateCcw className="w-4 h-4" /> Recommencer
        </button>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-6 max-w-xl mx-auto rounded-xl p-4 flex items-start gap-3"
            style={{
              background: feedback.ok
                ? "rgba(34,197,94,0.12)"
                : "rgba(212,175,55,0.08)",
              border: `1px solid ${
                feedback.ok ? "rgba(34,197,94,0.5)" : "rgba(212,175,55,0.4)"
              }`,
            }}
          >
            {feedback.ok ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <Lightbulb className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GOLD }} />
            )}
            <p
              className="text-sm font-medium leading-relaxed"
              style={{
                color: feedback.ok ? "#86efac" : OFF_WHITE,
              }}
            >
              {feedback.msg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
