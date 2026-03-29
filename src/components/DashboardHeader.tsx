import { Search, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNutrition } from "@/context/NutritionContext";

export function DashboardHeader() {
  const { mode } = useNutrition();

  return (
    <header className="h-16 flex items-center gap-4 px-4 md:px-6 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <SidebarTrigger className="shrink-0" />

      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un plat, ingrédient..."
          className="pl-9 rounded-xl bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <Badge
          variant="secondary"
          className={`hidden sm:flex text-xs font-medium rounded-full px-3 py-1 ${
            mode === "perte" ? "bg-emerald-soft text-emerald" : "gradient-cobalt text-primary-foreground"
          }`}
        >
          {mode === "perte" ? "🎯 Perte de Poids" : "💪 Prise de Masse"}
        </Badge>
        <div className="w-9 h-9 rounded-full gradient-cobalt flex items-center justify-center">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
    </header>
  );
}
