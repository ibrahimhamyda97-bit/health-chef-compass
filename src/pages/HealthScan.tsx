import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Flame, Dumbbell, Leaf, Camera, ArrowLeft, Sparkles, ChefHat, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Goal = "sopk" | "perte" | "masse" | "inflammation";
type Step = "select" | "capture" | "analyzing" | "result";

const GOALS: { id: Goal; title: string; subtitle: string; focus: string; icon: any; gradient: string }[] = [
  { id: "sopk", title: "SOPK", subtitle: "Équilibre Hormonal", focus: "Indice glycémique", icon: Activity, gradient: "from-purple-500/40 to-pink-500/40" },
  { id: "perte", title: "Perte de Poids", subtitle: "Léger & Rassasiant", focus: "Densité calorique & fibres", icon: Flame, gradient: "from-orange-500/40 to-red-500/40" },
  { id: "masse", title: "Prise de Masse", subtitle: "Force & Volume", focus: "Protéines & surplus", icon: Dumbbell, gradient: "from-blue-500/40 to-cyan-500/40" },
  { id: "inflammation", title: "Anti-Inflammatoire", subtitle: "Apaiser le corps", focus: "Bons gras & antioxydants", icon: Leaf, gradient: "from-emerald-500/40 to-teal-500/40" },
];

const ANALYSIS_MESSAGES: Record<Goal, string[]> = {
  sopk: ["Détection des aliments...", "Analyse de la charge glycémique...", "Évaluation de l'impact insuline...", "Calcul du score hormonal..."],
  perte: ["Détection des aliments...", "Calcul de la densité calorique...", "Mesure des fibres...", "Évaluation de la satiété..."],
  masse: ["Détection des aliments...", "Quantification des protéines...", "Calcul du surplus calorique...", "Score de prise de masse..."],
  inflammation: ["Détection des aliments...", "Recherche d'antioxydants...", "Analyse des oméga-3...", "Score anti-inflammatoire..."],
};

interface ScanResult {
  foods: { name: string; x: number; y: number }[];
  score: number;
  scoreLabel: string;
  gauges: { insulin: number; density: number; satiety: number };
  advice: string;
}

export default function HealthScan() {
  const [step, setStep] = useState<Step>("select");
  const [goal, setGoal] = useState<Goal | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Start camera when entering capture step
  useEffect(() => {
    if (step !== "capture") return;
    let active = true;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (!active) { s.getTracks().forEach((t) => t.stop()); return; }
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch {
        // Fallback to file picker
        toast.info("Caméra indisponible — sélectionne une photo");
        fileRef.current?.click();
      }
    })();
    return () => { active = false; };
  }, [step]);

  // Stop camera when leaving
  useEffect(() => {
    if (step === "capture") return;
    stream?.getTracks().forEach((t) => t.stop());
    if (stream) setStream(null);
  }, [step]);

  // Rotating messages during analysis
  useEffect(() => {
    if (step !== "analyzing" || !goal) return;
    const msgs = ANALYSIS_MESSAGES[goal];
    setMsgIdx(0);
    const id = setInterval(() => setMsgIdx((i) => (i + 1) % msgs.length), 1400);
    return () => clearInterval(id);
  }, [step, goal]);

  const capture = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d")!.drawImage(v, 0, 0);
    const data = canvas.toDataURL("image/jpeg", 0.85);
    setPhoto(data);
    analyze(data);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setPhoto(data);
      analyze(data);
    };
    reader.readAsDataURL(f);
  };

  const analyze = async (image: string) => {
    if (!goal) return;
    setStep("analyzing");
    try {
      const { data, error } = await supabase.functions.invoke("health-scan", { body: { image, goal } });
      if (error) throw error;
      if (!data?.result) throw new Error("Réponse invalide");
      setResult(data.result);
      setStep("result");
    } catch (e: any) {
      toast.error(e.message || "Échec de l'analyse");
      setStep("capture");
    }
  };

  const reset = () => {
    setStep("select");
    setGoal(null);
    setPhoto(null);
    setResult(null);
  };

  const scoreColor = (s: number) => s >= 80 ? "hsl(155 60% 45%)" : s >= 50 ? "hsl(35 90% 55%)" : "hsl(0 75% 55%)";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-cobalt flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-emerald" />
          Scan Santé Interactif
        </h1>
        <p className="text-muted-foreground mt-1">Analyse intelligente de ton assiette, pondérée par ton objectif.</p>
      </div>

      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div key="select" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 gap-5">
            {GOALS.map((g) => {
              const Icon = g.icon;
              return (
                <motion.button key={g.id} whileHover={{ scale: 1.02, y: -3 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setGoal(g.id); setStep("capture"); }}
                  className={`relative overflow-hidden rounded-3xl p-7 text-left bg-gradient-to-br ${g.gradient} backdrop-blur-2xl border border-amber-300/40 shadow-[0_8px_32px_rgba(31,38,135,0.15)] hover:border-amber-400/70 transition-all group`}>
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-xl" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-white/60 backdrop-blur flex items-center justify-center mb-4 shadow-sm border border-amber-200/50">
                      <Icon className="w-7 h-7 text-cobalt" />
                    </div>
                    <h3 className="font-display font-bold text-2xl text-foreground">{g.title}</h3>
                    <p className="text-sm font-medium text-foreground/70">{g.subtitle}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/70 border border-amber-300/50 text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Focus : {g.focus}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {step === "capture" && goal && (
          <motion.div key="capture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <Button variant="ghost" size="sm" onClick={reset} className="gap-2"><ArrowLeft className="w-4 h-4" /> Changer d'objectif</Button>

            <div className="relative aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden bg-black border border-border shadow-xl">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

              {/* Scanner overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Corners */}
                <div className="absolute inset-6 border-2 border-emerald/70 rounded-2xl" style={{ clipPath: "polygon(0 0, 15% 0, 15% 3px, 3px 3px, 3px 15%, 0 15%, 0 85%, 3px 85%, 3px calc(100% - 3px), 15% calc(100% - 3px), 15% 100%, 0 100%, 100% 100%, 100% 85%, calc(100% - 3px) 85%, calc(100% - 3px) calc(100% - 3px), 85% calc(100% - 3px), 85% 100%, 100% 100%, 100% 0, 85% 0, 85% 3px, calc(100% - 3px) 3px, calc(100% - 3px) 15%, 100% 15%)" }} />
                {/* Scan line */}
                <motion.div
                  className="absolute left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-emerald to-transparent shadow-[0_0_12px_hsl(155_60%_45%)]"
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* HUD text */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-white text-xs font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
                  ANALYSE IA · {GOALS.find((g) => g.id === goal)!.title.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={capture} size="lg" className="gap-2 rounded-full px-8 gradient-emerald text-accent-foreground hover:opacity-90">
                <Camera className="w-5 h-5" /> Analyser mon assiette
              </Button>
              <Button variant="outline" size="lg" onClick={() => fileRef.current?.click()} className="rounded-full">Importer</Button>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
            </div>
          </motion.div>
        )}

        {step === "analyzing" && goal && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="relative w-32 h-32">
              <motion.div className="absolute inset-0 rounded-full border-4 border-emerald/30" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
              <motion.div className="absolute inset-0 rounded-full border-4 border-t-emerald border-transparent" animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} />
              <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-10 h-10 text-emerald" /></div>
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={msgIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="text-lg font-medium text-cobalt">
                {ANALYSIS_MESSAGES[goal][msgIdx]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}

        {step === "result" && result && photo && goal && (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={reset} className="gap-2"><ArrowLeft className="w-4 h-4" /> Nouveau scan</Button>
              <Button variant="ghost" size="sm" onClick={() => { setPhoto(null); setResult(null); setStep("capture"); }} className="gap-2"><RotateCcw className="w-4 h-4" /> Re-scanner</Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Photo with floating tooltips */}
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-border bg-black aspect-[4/3]">
                <img src={photo} alt="assiette analysée" className="w-full h-full object-cover" />
                {result.foods.map((f, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.15 }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${Math.max(8, Math.min(92, f.x * 100))}%`, top: `${Math.max(8, Math.min(92, f.y * 100))}%` }}>
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-emerald shadow-[0_0_12px_hsl(155_60%_45%)] animate-pulse" />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-xs font-semibold text-cobalt shadow-md border border-border">
                        {f.name}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Score */}
              <div className="flex flex-col items-center justify-center p-6 rounded-3xl glass-card-solid">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Score · {GOALS.find((g) => g.id === goal)!.title}</p>
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <motion.circle cx="50" cy="50" r="44" fill="none" stroke={scoreColor(result.score)} strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 44}
                      initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - result.score / 100) }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-display font-bold" style={{ color: scoreColor(result.score) }}>{result.score}</span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                </div>
                <p className="mt-3 font-semibold" style={{ color: scoreColor(result.score) }}>{result.scoreLabel}</p>
              </div>
            </div>

            {/* Gauges */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Impact Insuline", value: result.gauges.insulin, hint: "favorable au profil hormonal" },
                { label: "Densité Nutritionnelle", value: result.gauges.density, hint: "richesse en micronutriments" },
                { label: "Indice de Satiété", value: result.gauges.satiety, hint: "pouvoir rassasiant" },
              ].map((g) => (
                <div key={g.label} className="p-4 rounded-2xl glass-card-solid">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-semibold text-cobalt">{g.label}</span>
                    <span className="text-lg font-display font-bold">{g.value}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: scoreColor(g.value) }}
                      initial={{ width: 0 }} animate={{ width: `${g.value}%` }} transition={{ duration: 1, ease: "easeOut" }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">{g.hint}</p>
                </div>
              ))}
            </div>

            {/* Chef advice */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="p-5 rounded-3xl border border-amber-300/50 bg-gradient-to-br from-amber-50 to-emerald-50 shadow-sm flex gap-4">
              <div className="w-12 h-12 rounded-full gradient-emerald flex items-center justify-center shrink-0 shadow">
                <ChefHat className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-amber-700 font-semibold">Le Conseil du Chef</p>
                <p className="text-foreground mt-1 leading-relaxed">{result.advice}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
