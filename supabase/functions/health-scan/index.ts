import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GOAL_FOCUS: Record<string, string> = {
  sopk: "SOPK (Équilibre Hormonal) — pondère fortement la charge glycémique (sucres rapides, féculents raffinés pénalisés ; fibres, protéines et bons gras valorisés). L'impact insuline est le critère #1.",
  perte: "Perte de Poids — pondère la densité calorique (kcal/100g) et les fibres. Pénalise les fritures, sauces grasses, gros volumes caloriques. Valorise les légumes, protéines maigres, satiété.",
  masse: "Prise de Masse — pondère les protéines et le surplus calorique de qualité. Valorise les portions généreuses, glucides complexes, lipides sains. Pénalise les repas trop pauvres en kcal/protéines.",
  inflammation: "Anti-Inflammatoire — pondère les bons gras (oméga-3), antioxydants, polyphénols, légumes colorés. Pénalise sucres ajoutés, charcuteries, fritures, ultra-transformés.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image, goal } = await req.json();
    if (!image || !goal) {
      return new Response(JSON.stringify({ error: "image et goal requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const focus = GOAL_FOCUS[goal] || GOAL_FOCUS.perte;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const systemPrompt = `Tu es un nutritionniste-chef expert. Tu analyses une photo d'assiette et tu retournes une évaluation pondérée par l'objectif santé de l'utilisateur. Réponds UNIQUEMENT avec un JSON strict, sans markdown.`;

    const userPrompt = `Objectif de l'utilisateur : ${focus}

Analyse l'image de l'assiette fournie et retourne EXACTEMENT ce JSON :
{
  "foods": [
    {"name": "Aliment reconnu", "x": 0.42, "y": 0.55}
  ],
  "score": 78,
  "scoreLabel": "Bon | Moyen | À revoir",
  "gauges": {
    "insulin": 70,
    "density": 80,
    "satiety": 65
  },
  "advice": "Conseil concret du chef en 1-2 phrases pour améliorer ce repas selon l'objectif."
}

Règles :
- "foods" : 2 à 6 aliments principaux visibles. x,y sont des coords relatives 0-1 sur l'image (centre de l'aliment).
- "score" : 0-100 PONDÉRÉ par l'objectif (un avocat ≈ 95 en Anti-inflammatoire mais ≈ 65 en Perte de poids).
- "gauges" : 0-100. "insulin" = qualité de l'impact insulinique (100 = très favorable, faible charge glycémique).
- "advice" : commence par un verbe d'action, sois spécifique à l'objectif.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: image } },
          ]},
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error", response.status, t);
      if (response.status === 429) return new Response(JSON.stringify({ error: "Trop de requêtes" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content?.trim() || "";
    if (content.startsWith("```")) content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const result = JSON.parse(content);

    return new Response(JSON.stringify({ result }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("health-scan error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
