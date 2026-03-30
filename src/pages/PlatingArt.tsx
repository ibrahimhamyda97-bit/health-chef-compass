import { motion } from "framer-motion";
import PlatingGallery from "@/components/plating/PlatingGallery";
import TechniqueCourses from "@/components/plating/TechniqueCourses";
import UtensilsEncyclopedia from "@/components/plating/UtensilsEncyclopedia";
import GoldenRules from "@/components/plating/GoldenRules";

export default function PlatingArt() {
  return (
    <div className="space-y-10 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Académie HaMenu ✨</h1>
        <p className="text-muted-foreground text-sm">
          Maîtrisez les techniques de dressage pour sublimer chaque assiette comme un chef étoilé.
        </p>
      </motion.div>

      {/* Technique Courses */}
      <TechniqueCourses />

      {/* Gallery by category */}
      <PlatingGallery />

      {/* Utensils Encyclopedia */}
      <UtensilsEncyclopedia />

      {/* Golden Rules */}
      <GoldenRules />
    </div>
  );
}
