import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ingredients, mode } = await req.json();
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(JSON.stringify({ error: "Ingrédients requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let modeInstruction = "";
    if (mode === "perte") {
      modeInstruction = "\nIMPORTANT : La recette doit être légère et adaptée à une perte de poids (max 500 kcal par personne, peu de matières grasses).";
    } else if (mode === "masse") {
      modeInstruction = "\nIMPORTANT : La recette doit être riche en protéines pour la prise de masse (au moins 30g de protéines par personne).";
    }

    const systemPrompt = `Tu es HamIA, une cheffe cuisinière virtuelle experte et chaleureuse. Tu crées des recettes savoureuses à partir des ingrédients disponibles. Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans commentaire.`;

    const userPrompt = `Crée une recette complète et détaillée en utilisant UNIQUEMENT ces ingrédients : ${ingredients.join(", ")}.
Tu peux ajouter des assaisonnements de base (sel, poivre, huile d'olive) sans les compter comme ingrédients supplémentaires.${modeInstruction}

Retourne EXACTEMENT ce format JSON :
{
  "name": "Nom du plat créatif",
  "image_emoji": "🍽️",
  "prepTime": "15 min",
  "cookTime": "20 min",
  "difficulty": "Facile|Moyen|Difficile",
  "servings": 2,
  "description": "Description appétissante du plat en 1-2 phrases",
  "ingredients": [
    {"name": "Ingredient", "quantity": 200, "unit": "g"}
  ],
  "steps": [
    "Étape 1 détaillée et claire",
    "Étape 2 détaillée et claire"
  ],
  "nutrition": {
    "calories": 350,
    "protein": 25,
    "carbs": 30,
    "fat": 12,
    "fiber": 5
  },
  "tags": ["tag1", "tag2"],
  "hamia_tip": "Un conseil de chef personnalisé pour réussir ce plat"
}

Les unités possibles : g, kg, cl, ml, L, cuillères à soupe, cuillères à café, pièces, tranches, gousses, pincée.
La nutrition est par personne. Sois créatif, précis et réaliste.`;

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
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

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
    console.error("fridge-recipe error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
