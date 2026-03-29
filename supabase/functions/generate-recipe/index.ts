import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { dishName, servings } = await req.json();
    if (!dishName || typeof dishName !== "string" || dishName.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Nom du plat requis (min 2 caractères)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const portions = servings || 4;

    const systemPrompt = `Tu es un chef cuisinier expert et nutritionniste. Tu génères des fiches recettes complètes au format JSON strict.
Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans commentaire.`;

    const userPrompt = `Génère une fiche recette complète pour "${dishName.trim()}" pour ${portions} personne(s).

Retourne EXACTEMENT ce format JSON :
{
  "name": "Nom du plat",
  "image_emoji": "🍽️",
  "prepTime": "25 min",
  "cookTime": "30 min",
  "difficulty": "Facile|Moyen|Difficile",
  "servings": ${portions},
  "description": "Courte description du plat",
  "ingredients": [
    {"name": "Ingredient", "quantity": 200, "unit": "g"},
    {"name": "Ingredient2", "quantity": 2, "unit": "pièces"}
  ],
  "steps": [
    "Étape 1 claire et concise",
    "Étape 2 claire et concise"
  ],
  "nutrition": {
    "calories": 450,
    "protein": 35,
    "carbs": 40,
    "fat": 15,
    "fiber": 6
  },
  "tags": ["tag1", "tag2"]
}

Les unités possibles : g, kg, cl, ml, L, cuillères à soupe, cuillères à café, pièces, tranches, gousses, pincée.
La nutrition est par personne. Sois précis et réaliste.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error("Empty AI response");

    // Extract JSON from response (strip markdown fences if present)
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const recipe = JSON.parse(jsonStr);

    return new Response(JSON.stringify({ recipe }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-recipe error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
