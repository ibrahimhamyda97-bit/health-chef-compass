import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, Clock, BarChart3, Image, Video, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PastryCourse {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  difficulty: string;
  duration: string | null;
  content: string | null;
  steps: string[];
  published: boolean;
  photos: string[];
  videos: string[];
}

const difficultyColors: Record<string, string> = {
  "débutant": "bg-green-500/10 text-green-500",
  "intermédiaire": "bg-yellow-500/10 text-yellow-500",
  "avancé": "bg-red-500/10 text-red-500",
};

export default function PastryCourses() {
  const [courses, setCourses] = useState<PastryCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [zoomedMedia, setZoomedMedia] = useState<{ type: "photo" | "video"; src: string } | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from("pastry_courses").select("*").eq("published", true).order("created_at", { ascending: false });
      if (data) setCourses(data.map((c: any) => ({
        ...c,
        steps: Array.isArray(c.steps) ? c.steps : [],
        photos: Array.isArray(c.photos) ? c.photos : [],
        videos: Array.isArray(c.videos) ? c.videos : [],
      })));
      setLoading(false);
    };
    fetchCourses();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> Cours de Pâtisserie 🍰
        </h1>
        <p className="text-muted-foreground text-sm">Découvrez nos cours et perfectionnez vos techniques.</p>
      </motion.div>

      {loading ? (
        <p className="text-muted-foreground text-sm text-center py-12">Chargement des cours...</p>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-2">📚</p>
          <p>Aucun cours disponible pour le moment.</p>
          <p className="text-xs mt-1">Revenez bientôt !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card-solid rounded-2xl overflow-hidden"
            >
              {course.image_url && (
                <img src={course.image_url} alt={course.title} className="w-full h-44 object-cover" />
              )}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-semibold">{course.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${difficultyColors[course.difficulty] || "bg-muted text-muted-foreground"}`}>
                    {course.difficulty}
                  </span>
                </div>
                {course.duration && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {course.duration}
                  </p>
                )}
                {course.description && <p className="text-sm text-muted-foreground">{course.description}</p>}

                {/* Photos gallery */}
                {course.photos.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2"><Image className="w-3 h-3" /> Photos</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {course.photos.map((photo, pi) => (
                        <img
                          key={pi}
                          src={photo}
                          alt={`${course.title} photo ${pi + 1}`}
                          className="w-20 h-20 rounded-lg object-cover cursor-zoom-in hover:scale-105 transition-transform shrink-0"
                          onClick={() => setZoomedMedia({ type: "photo", src: photo })}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {course.videos.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2"><Video className="w-3 h-3" /> Vidéos</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {course.videos.map((video, vi) => (
                        <button
                          key={vi}
                          onClick={() => setZoomedMedia({ type: "video", src: video })}
                          className="w-24 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 hover:bg-muted/80 transition-colors"
                        >
                          <Play className="w-6 h-6 text-primary" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {course.content && (
                  <div>
                    <button
                      onClick={() => setExpandedId(expandedId === course.id ? null : course.id)}
                      className="flex items-center gap-1 text-primary text-xs font-medium hover:underline"
                    >
                      Voir le contenu
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedId === course.id ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {expandedId === course.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{course.content}</p>
                          {course.steps.length > 0 && (
                            <ol className="mt-3 space-y-2">
                              {course.steps.map((step, si) => (
                                <li key={si} className="flex gap-2 text-xs text-muted-foreground">
                                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                    {si + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Media zoom dialog */}
      <Dialog open={!!zoomedMedia} onOpenChange={() => setZoomedMedia(null)}>
        <DialogContent className="max-w-3xl p-2">
          {zoomedMedia?.type === "photo" && (
            <img src={zoomedMedia.src} alt="Zoom" className="w-full h-auto rounded-lg" />
          )}
          {zoomedMedia?.type === "video" && (
            <video src={zoomedMedia.src} controls autoPlay className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
