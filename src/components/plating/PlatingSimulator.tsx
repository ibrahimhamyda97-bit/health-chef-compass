import { type CSSProperties, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Lightbulb, RotateCcw, Sparkles, Minus, Plus, X } from "lucide-react";
import foodSprite from "@/assets/plating/food-sprite.png";

const GOLD = "hsl(45, 65%, 52%)";
const OFF_WHITE = "#F8F9FA";

type ToolKind = string;

interface Tool {
  kind: ToolKind;
  label: string;
  hint: string;
  size: number;
  sprite: [number, number];
  category: "Protéines" | "Féculents" | "Légumes" | "Sauces" | "Finitions" | "Fruits" | "Premium";
}

const TOOLS: Tool[] = [
  // Protéines
  { kind: "meat", label: "Pièce de viande", hint: "Bœuf grillé", size: 130, sprite: [0, 0], category: "Protéines" },
  { kind: "chicken", label: "Poulet rôti", hint: "Volaille dorée", size: 120, sprite: [0, 1], category: "Protéines" },
  { kind: "salmon", label: "Pavé de saumon", hint: "Poisson noble", size: 120, sprite: [0, 2], category: "Protéines" },
  { kind: "shrimp", label: "Crevettes", hint: "Fruits de mer", size: 90, sprite: [0, 3], category: "Protéines" },
  { kind: "egg", label: "Œuf poché", hint: "Jaune coulant", size: 95, sprite: [0, 4], category: "Protéines" },
  { kind: "tofu", label: "Tofu grillé", hint: "Option végé", size: 100, sprite: [0, 5], category: "Protéines" },
  { kind: "steak", label: "Filet de bœuf", hint: "Tendre & rosé", size: 125, sprite: [0, 6], category: "Protéines" },
  { kind: "bacon", label: "Bacon croustillant", hint: "Touche fumée", size: 95, sprite: [1, 0], category: "Protéines" },

  // Féculents
  { kind: "puree", label: "Quenelle de purée", hint: "Base crémeuse", size: 110, sprite: [1, 1], category: "Féculents" },
  { kind: "rice", label: "Riz basmati", hint: "Grains parfumés", size: 105, sprite: [2, 2], category: "Féculents" },
  { kind: "pasta", label: "Pâtes fraîches", hint: "Tagliatelles", size: 110, sprite: [2, 2], category: "Féculents" },
  { kind: "potato", label: "Pomme de terre", hint: "Rôtie au four", size: 100, sprite: [2, 4], category: "Féculents" },
  { kind: "quinoa", label: "Quinoa", hint: "Sans gluten", size: 95, sprite: [2, 5], category: "Féculents" },
  { kind: "bread", label: "Pain de campagne", hint: "Croûte dorée", size: 100, sprite: [2, 6], category: "Féculents" },

  // Légumes
  { kind: "asparagus", label: "Asperges vertes", hint: "Élégance", size: 130, sprite: [3, 0], category: "Légumes" },
  { kind: "carrot", label: "Radis croquant", hint: "Fraîcheur rosée", size: 95, sprite: [6, 6], category: "Légumes" },
  { kind: "broccoli", label: "Brocoli", hint: "Croquant vert", size: 95, sprite: [2, 3], category: "Légumes" },
  { kind: "tomato", label: "Tomate cerise", hint: "Acidulée", size: 70, sprite: [2, 3], category: "Légumes" },
  { kind: "mushroom", label: "Champignons", hint: "Umami terrien", size: 90, sprite: [2, 4], category: "Légumes" },
  { kind: "zucchini", label: "Courgette", hint: "Lamelles fines", size: 95, sprite: [3, 3], category: "Légumes" },
  { kind: "beet", label: "Chou-fleur", hint: "Fleur blanche", size: 95, sprite: [6, 3], category: "Légumes" },
  { kind: "corn", label: "Maïs grillé", hint: "Doux & sucré", size: 100, sprite: [3, 1], category: "Légumes" },
  { kind: "avocado", label: "Crème verte", hint: "Onctueux", size: 100, sprite: [6, 4], category: "Légumes" },

  // Sauces
  { kind: "sauce", label: "Trait de sauce", hint: "Liant aromatique", size: 140, sprite: [3, 2], category: "Sauces" },
  { kind: "pesto", label: "Pesto", hint: "Vert basilic", size: 100, sprite: [6, 4], category: "Sauces" },
  { kind: "berry-coulis", label: "Coulis de fruits", hint: "Touche sucrée", size: 110, sprite: [3, 5], category: "Sauces" },
  { kind: "balsamic", label: "Réduction balsamique", hint: "Sirupeux", size: 110, sprite: [3, 2], category: "Sauces" },

  // Finitions
  { kind: "greens", label: "Micro-pousses", hint: "Touche finale", size: 75, sprite: [3, 4], category: "Finitions" },
  { kind: "herbs", label: "Herbes fraîches", hint: "Persil, ciboulette", size: 70, sprite: [3, 4], category: "Finitions" },
  { kind: "edible-flower", label: "Radis fin", hint: "Élégance suprême", size: 65, sprite: [6, 6], category: "Finitions" },
  { kind: "lemon", label: "Suprême d'orange", hint: "Fraîcheur", size: 70, sprite: [4, 1], category: "Finitions" },
  { kind: "sesame", label: "Graines de sésame", hint: "Croquant fin", size: 60, sprite: [5, 3], category: "Finitions" },
  { kind: "pepper", label: "Poivre concassé", hint: "Mouture fraîche", size: 60, sprite: [5, 3], category: "Finitions" },

  // Fruits
  { kind: "raspberry", label: "Framboises", hint: "Note fruitée", size: 75, sprite: [3, 6], category: "Fruits" },
  { kind: "fig", label: "Figue", hint: "Sucré & charnu", size: 90, sprite: [4, 0], category: "Fruits" },
  { kind: "grape", label: "Raisin", hint: "Grappes brillantes", size: 85, sprite: [4, 0], category: "Fruits" },
  { kind: "orange", label: "Suprême d'orange", hint: "Acidité solaire", size: 85, sprite: [4, 1], category: "Fruits" },

  // Premium
  { kind: "caviar", label: "Caviar", hint: "Luxe iodé", size: 80, sprite: [4, 2], category: "Premium" },
  { kind: "truffle", label: "Truffe noire", hint: "Râpée minute", size: 70, sprite: [4, 4], category: "Premium" },
  { kind: "foie-gras", label: "Burrata", hint: "Fondant", size: 105, sprite: [6, 2], category: "Premium" },
  { kind: "gold-leaf", label: "Feuille d'or", hint: "Touche royale", size: 70, sprite: [4, 5], category: "Premium" },
];

const CATEGORIES: Tool["category"][] = ["Protéines", "Féculents", "Légumes", "Sauces", "Finitions", "Fruits", "Premium"];
const SPRITE_COLS = 7;
const SPRITE_ROWS = 7;

function foodSpriteStyle(tool: Tool): CSSProperties {
  const [row, col] = tool.sprite;
  return {
    backgroundImage: `url(${foodSprite})`,
    backgroundSize: `${SPRITE_COLS * 100}% ${SPRITE_ROWS * 100}%`,
    backgroundPosition: `${(col / (SPRITE_COLS - 1)) * 100}% ${(row / (SPRITE_ROWS - 1)) * 100}%`,
    backgroundRepeat: "no-repeat",
  };
}

interface Placed {
  id: string;
  kind: ToolKind;
  x: number;
  y: number;
  scale: number;
}

const PLATE_SIZE = 380;
const PLATE_RADIUS = PLATE_SIZE / 2;

export default function PlatingSimulator() {
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState<Tool["category"]>("Protéines");
  const plateRef = useRef<HTMLDivElement>(null);

  function addTool(kind: ToolKind) {
    setFeedback(null);
    const id = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setPlaced((prev) => [...prev, { id, kind, x: 0, y: 0, scale: 1 }]);
    setSelectedId(id);
  }

  function removeTool(id: string) {
    setPlaced((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function reset() {
    setPlaced([]);
    setFeedback(null);
    setSelectedId(null);
  }

  function changeScale(id: string, delta: number) {
    setPlaced((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, scale: Math.max(0.4, Math.min(2.5, p.scale + delta)) } : p
      )
    );
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

  function onWheel(e: React.WheelEvent, id: string) {
    e.preventDefault();
    changeScale(id, e.deltaY < 0 ? 0.08 : -0.08);
  }

  function check() {
    if (placed.length === 0) {
      setFeedback({ ok: false, msg: "Commence par ajouter au moins un élément !" });
      return;
    }
    const inside = placed.filter((p) => Math.hypot(p.x, p.y) <= PLATE_RADIUS - 30);
    if (inside.length < placed.length) {
      setFeedback({ ok: false, msg: "Certains éléments débordent — recadre vers le centre." });
      return;
    }
    if (placed.length < 3) {
      setFeedback({ ok: false, msg: "Compose un vrai dressage avec au moins 3 éléments." });
      return;
    }
    const avgDist = placed.reduce((acc, p) => acc + Math.hypot(p.x, p.y), 0) / placed.length;
    if (avgDist < PLATE_RADIUS * 0.1) {
      setFeedback({ ok: false, msg: "Tout est collé au centre. Aère ta composition (règle des tiers)." });
      return;
    }
    if (avgDist > PLATE_RADIUS * 0.7) {
      setFeedback({ ok: false, msg: "Trop dispersé vers les bords — recentre légèrement." });
      return;
    }
    setFeedback({ ok: true, msg: "Bravo, l'équilibre est parfait !" });
  }

  const visibleTools = TOOLS.filter((t) => t.category === activeCat);

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
          Glisse les ingrédients, agrandis-les avec la molette ou les boutons +/−, puis valide ta composition.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">
        {/* Plate */}
        <div className="flex justify-center">
          <div
            ref={plateRef}
            className="relative shrink-0 select-none touch-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedId(null);
            }}
            style={{
              width: PLATE_SIZE,
              height: PLATE_SIZE,
              filter: "drop-shadow(0 40px 50px rgba(0,0,0,0.65)) drop-shadow(0 10px 20px rgba(0,0,0,0.4))",
            }}
          >
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, #ffffff 0%, #fafafa 55%, #ececec 85%, #d8d8d8 100%)",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "inset 0 0 0 14px #ffffff, inset 0 0 0 15px rgba(0,0,0,0.05)",
              }}
            />
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
                <p className="text-xs italic text-neutral-500">Choisis une catégorie et ajoute des ingrédients →</p>
              </div>
            )}

            {placed.map((p, idx) => {
              const tool = TOOLS.find((t) => t.kind === p.kind);
              if (!tool) return null;
              const isDragging = draggingId === p.id;
              const isSelected = selectedId === p.id;
              const renderedSize = tool.size * p.scale;
              return (
                <motion.div
                  key={p.id}
                  onPointerDown={(e) => {
                    (e.target as HTMLElement).setPointerCapture(e.pointerId);
                    setDraggingId(p.id);
                    setSelectedId(p.id);
                  }}
                  onPointerMove={(e) => onPointerMove(e, p.id)}
                  onPointerUp={() => setDraggingId(null)}
                  onWheel={(e) => onWheel(e, p.id)}
                  onDoubleClick={() => removeTool(p.id)}
                  className="absolute cursor-grab active:cursor-grabbing flex items-center justify-center"
                  style={{
                    width: renderedSize,
                    height: renderedSize,
                    left: `calc(50% + ${p.x}px - ${renderedSize / 2}px)`,
                    top: `calc(50% + ${p.y}px - ${renderedSize / 2}px)`,
                    zIndex: isDragging ? 50 : 10 + idx,
                    filter: isDragging
                      ? "drop-shadow(0 18px 22px rgba(0,0,0,0.55))"
                      : "drop-shadow(0 8px 10px rgba(0,0,0,0.45))",
                    outline: isSelected ? `2px dashed ${GOLD}` : "none",
                    outlineOffset: 4,
                    borderRadius: "50%",
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: isDragging ? 1.05 : 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 22 }}
                  title={`${tool.label} — molette pour redimensionner, double-clic pour retirer`}
                >
                  <span
                    aria-label={tool.label}
                    className="block w-full h-full pointer-events-none"
                    style={foodSpriteStyle(tool)}
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

          {/* Selected item controls */}
          {selectedId && (
            <div
              className="mb-3 p-2.5 rounded-lg flex items-center justify-between gap-2"
              style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)" }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: GOLD }}>
                Taille
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => changeScale(selectedId, -0.15)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10"
                  style={{ border: `1px solid ${GOLD}`, color: GOLD }}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => changeScale(selectedId, 0.15)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10"
                  style={{ border: `1px solid ${GOLD}`, color: GOLD }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => removeTool(selectedId)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-500/20 ml-1"
                  style={{ border: "1px solid rgba(239,68,68,0.5)", color: "#fca5a5" }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1 mb-3">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className="px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all"
                style={{
                  background: activeCat === c ? GOLD : "rgba(0,0,0,0.4)",
                  color: activeCat === c ? "#1a1410" : OFF_WHITE,
                  border: `1px solid ${activeCat === c ? GOLD : "rgba(212,175,55,0.2)"}`,
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {visibleTools.map((t) => (
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
                  className="w-11 h-11 flex items-center justify-center rounded-full shrink-0 overflow-hidden"
                  style={{
                    background: "radial-gradient(circle at 35% 30%, #fafafa 0%, #d8d8d8 80%)",
                    border: "1.5px solid rgba(255,255,255,0.25)",
                  }}
                >
                  <span aria-hidden className="block w-10 h-10" style={foodSpriteStyle(t)} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold truncate">{t.label}</span>
                  <span className="block text-[10px] opacity-60 truncate">{t.hint}</span>
                </span>
              </motion.button>
            ))}
          </div>
          <p className="text-[10px] mt-3 italic opacity-50" style={{ color: OFF_WHITE }}>
            Molette = agrandir/réduire. Clic = sélectionner. Double-clic = retirer.
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
